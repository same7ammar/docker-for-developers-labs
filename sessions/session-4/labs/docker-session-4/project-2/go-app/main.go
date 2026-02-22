package main

import (
	"fmt"
	"net/http"
	"os"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        hostname, _ := os.Hostname()
        fmt.Fprintf(w, "Hello from Go!\nHostname: %s\n", hostname)
    })
    
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, `{"status": "healthy"}`)
    })
    
    fmt.Println("Server starting on :8080")
    http.ListenAndServe(":8080", nil)
}