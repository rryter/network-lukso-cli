package metrics

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"lukso/apps/lukso-manager/shared"
	"net/http"

	dto "github.com/prometheus/client_model/go"
	"github.com/prometheus/common/expfmt"
)

type MetricsResponseData struct {
	Peers             int64 `json:"peers"`
	ChainData         int64 `json:"chainData"`
	Validators        int64 `json:"validators"`
	ValidatorsBalance int64 `json:"validatorsBalance"`
}

type CpuAndMemoryResponseData struct {
	Sysload    int64 `json:"cpuSysload"`
	MemoryUsed int64 `json:"memUsed"`
}

func CpuAndMemoryMetrics(w http.ResponseWriter, r *http.Request) {
	body, err := getMetrics("http://127.0.0.1:6060/debug/metrics", w)
	if err != nil {
		return
	}

	var cpuAndMemorymetrics map[string]float64
	json.Unmarshal(body, &cpuAndMemorymetrics)

	var response CpuAndMemoryResponseData = CpuAndMemoryResponseData{
		Sysload:    int64(cpuAndMemorymetrics["system/cpu/sysload"]),
		MemoryUsed: int64(cpuAndMemorymetrics["system/memory/used"]),
	}

	jsonString, err := json.Marshal(response)
	if err != nil {
		fmt.Println(err)
		shared.HandleError(err, w)
		return
	}

	returnBody(jsonString, w)
}

func VanguardMetrics(w http.ResponseWriter, r *http.Request) {
	body, metricsError := getMetrics("http://127.0.0.1:8080/metrics", w)
	if metricsError != nil {
		shared.HandleError(metricsError, w)
		return
	}

	metricFamily, parsingMetricsError := parseMetricFamily(body)

	if parsingMetricsError != nil {
		shared.HandleError(parsingMetricsError, w)
		return
	}

	peers := metricFamily["p2p_peer_count"].GetMetric()
	chainData := metricFamily["beacon_head_slot"].GetMetric()
	validators := metricFamily[`validator_count`].GetMetric()
	validatorsBalance := metricFamily[`validators_total_effective_balance`].GetMetric()

	if peers == nil || chainData == nil {
		return
	}

	validatorCount := int64(0)
	if len(validators) > 0 && int64(*validators[0].Gauge.Value) != int64(0) {
		validatorCount = int64(*validators[0].Gauge.Value)
	}

	validatorsBalance1 := int64(0)
	if len(validatorsBalance) > 0 && int64(*validatorsBalance[0].Gauge.Value) != int64(0) {
		validatorsBalance1 = int64(*validatorsBalance[0].Gauge.Value) / 1_000_000_000
	}

	// TODO: proper error handling in case the structure of the metrics changes
	var response MetricsResponseData = MetricsResponseData{
		Peers:             int64(*peers[1].Gauge.Value),
		ChainData:         int64(*chainData[0].Gauge.Value),
		Validators:        int64(validatorCount),
		ValidatorsBalance: int64(validatorsBalance1),
	}

	peersOverTimeError := setPeersOverTime(*peers[1].Gauge.Value, "vanguard")
	if peersOverTimeError != nil {
		fmt.Println(peersOverTimeError)
		shared.HandleError(peersOverTimeError, w)
		return
	}

	jsonString, jsonMarshalError := json.Marshal(response)
	if jsonMarshalError != nil {
		fmt.Println(jsonMarshalError)
		shared.HandleError(jsonMarshalError, w)
		return
	}

	returnBody(jsonString, w)
}

func PandoraMetrics(w http.ResponseWriter, r *http.Request) {
	body, err := getMetrics("http://127.0.0.1:6060/debug/metrics", w)
	if err != nil {
		return
	}

	var pandoraMetrics map[string]float64

	json.Unmarshal(body, &pandoraMetrics)

	// TODO: proper error handling in case the structure of the metrics changes
	var response MetricsResponseData = MetricsResponseData{
		Peers:     int64(pandoraMetrics["p2p/peers"]),
		ChainData: int64(pandoraMetrics["chain/head/block"]),
	}

	peersOverTimeError := setPeersOverTime(pandoraMetrics["p2p/peers"], "pandora")
	if peersOverTimeError != nil {
		fmt.Println(peersOverTimeError)
		shared.HandleError(peersOverTimeError, w)
		return
	}

	jsonString, err := json.Marshal(response)
	if err != nil {
		fmt.Println(err)
		shared.HandleError(err, w)
		return
	}

	returnBody(jsonString, w)
}

func ValidatorMetrics(w http.ResponseWriter, r *http.Request) {
	body, err := getMetrics("http://127.0.0.1:8081/metrics", w)
	if err != nil {
		shared.HandleError(err, w)
		return
	}
	returnBody(body, w)
}

func Health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"ok": "true"}`))
}

func getMetrics(url string, w http.ResponseWriter) (body []byte, err error) {
	resp, err := http.Get(url)
	if err != nil {
		shared.HandleError(err, w)
		return
	}

	body, err2 := ioutil.ReadAll(resp.Body)
	if err2 != nil {
		shared.HandleError(err, w)
		return
	}

	return
}

func GetPandoraPeersOverTime(w http.ResponseWriter, r *http.Request) {
	metrics, err := getPeersOverTime("pandora")
	if err != nil {
		shared.HandleError(err, w)
		return
	}

	jsonString, _ := json.Marshal(metrics)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(jsonString))
}

func GetVanguardPeersOverTime(w http.ResponseWriter, r *http.Request) {
	metrics, err := getPeersOverTime("vanguard")
	if err != nil {
		shared.HandleError(err, w)
		return
	}

	jsonString, _ := json.Marshal(metrics)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(jsonString))
}

func returnBody(body []byte, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(body)
}

func decodeSettings(data []byte) (metrics map[int64]float64, err error) {
	err = json.Unmarshal(data, &metrics)
	if err != nil {
		return
	}
	return
}

func parseMetricFamily(text []byte) (map[string]*dto.MetricFamily, error) {
	var parser expfmt.TextParser
	mf, err := parser.TextToMetricFamilies(bytes.NewReader(text))
	if err != nil {
		return nil, err
	}
	return mf, nil
}
