package services

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"time"

	"github.com/google/uuid"
)

type MpesaDisbursementRequest struct {
	ReceiverPhone string  `json:"receiver_phone"`
	Amount        float64 `json:"amount"`
	TaskID        string  `json:"task_id"`
}
type MpesaDisbursementResponse struct {
	ConversationID           string    `json:"conversation_id"`
	OriginatorConversationID string    `json:"originator_conversation_id"`
	ResponseCode             string    `json:"response_code"`
	ResponseDescription      string    `json:"response_description"`
	TransactionID            string    `json:"transaction_id"`
	RecipientName            string    `json:"recipient_name"`
	DisbursedAmount          float64   `json:"disbursed_amount"`
	Timestamp                time.Time `json:"timestamp"`
}

var phoneRegex = regexp.MustCompile(`^(?:254|\+254|0)?(7|1)\d{8}$`)

func DisburseContractorFunds(req MpesaDisbursementRequest, contractorName string) (*MpesaDisbursementResponse, error) {
	if req.Amount <= 0 {
		return nil, fmt.Errorf("invalid disbursement amount: %.2f KSh (must be greater than 0)", req.Amount)
	}

	if !phoneRegex.MatchString(req.ReceiverPhone) {
		return nil, fmt.Errorf("invalid receiver phone format: %s. Must be a valid Kenyan mobile number (e.g. 2547XXXXXXXX)", req.ReceiverPhone)
	}

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	sleepDuration := time.Duration(250+rng.Intn(600)) * time.Millisecond
	time.Sleep(sleepDuration)

	if rng.Float32() < 0.025 {
		return nil, fmt.Errorf("Safaricom API gateway response: [504] Upstream third-party timeout - please retry")
	}

	txID := fmt.Sprintf("B2C%s", uuid.New().String()[:10])
	convID := uuid.New().String()
	origConvID := uuid.New().String()

	return &MpesaDisbursementResponse{
		ConversationID:           convID,
		OriginatorConversationID: origConvID,
		ResponseCode:             "0",
		ResponseDescription:      "Accept the service request successfully.",
		TransactionID:            txID,
		RecipientName:            contractorName,
		DisbursedAmount:          req.Amount,
		Timestamp:                time.Now(),
	}, nil
}

type STKPushPayload struct {
	BusinessShortCode string `json:"BusinessShortCode"`
	Password          string `json:"Password"`
	Timestamp         string `json:"Timestamp"`
	TransactionType   string `json:"TransactionType"`
	Amount            string `json:"Amount"`
	PartyA            string `json:"PartyA"`
	PartyB            string `json:"PartyB"`
	PhoneNumber       string `json:"PhoneNumber"`
	CallBackURL       string `json:"CallBackURL"`
	AccountReference  string `json:"AccountReference"`
	TransactionDesc   string `json:"TransactionDesc"`
}

type mpesaTokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   string `json:"expires_in"`
}

func getAccessToken() (string, error) {
	key := os.Getenv("MPESA_CONSUMER_KEY")
	secret := os.Getenv("MPESA_CONSUMER_SECRET")

	authString := key + ":" + secret
	encodedAuth := base64.StdEncoding.EncodeToString([]byte(authString))

	url := "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Basic "+encodedAuth)

	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return "", fmt.Errorf("failed to get token, status code: %d", res.StatusCode)
	}

	body, _ := io.ReadAll(res.Body)
	var tokenRes mpesaTokenResponse
	json.Unmarshal(body, &tokenRes)

	return tokenRes.AccessToken, nil
}

func InitiateSTKPush(phoneNumber string, amount string, taskID string) error {
	// 1. Get the temporary access token
	accessToken, err := getAccessToken()
	if err != nil {
		return fmt.Errorf("auth error: %v", err)
	}

	shortcode := os.Getenv("MPESA_SHORTCODE")
	passkey := os.Getenv("MPESA_PASSKEY")

	timestamp := time.Now().Format("20060102150405")

	passwordStr := fmt.Sprintf("%s%s%s", shortcode, passkey, timestamp)
	password := base64.StdEncoding.EncodeToString([]byte(passwordStr))

	payload := STKPushPayload{
		BusinessShortCode: shortcode,
		Password:          password,
		Timestamp:         timestamp,
		TransactionType:   "CustomerPayBillOnline",
		Amount:            amount,
		PartyA:            phoneNumber, // Customer's phone (e.g., 2547XXXXXXXX)
		PartyB:            shortcode,   // Your till/paybill
		PhoneNumber:       phoneNumber,

		CallBackURL:      "https://blcts-backend.onrender.com/api/mpesa/callback",
		AccountReference: taskID,
		TransactionDesc:  "BLCTS Maintenance Payment",
	}

	jsonPayload, _ := json.Marshal(payload)

	// 2. Send the STK Push request to Safaricom's Daraja API
	req, _ := http.NewRequest("POST", "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", bytes.NewBuffer(jsonPayload))
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to reach Daraja STK endpoint: %v", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	fmt.Printf("Daraja STK Response: %s\n", string(respBody))

	if resp.StatusCode != 200 {
		return fmt.Errorf("STK push failed with status %d", resp.StatusCode)
	}

	return nil
}
