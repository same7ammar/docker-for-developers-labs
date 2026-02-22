FROM golang:1.21 
WORKDIR /app
COPY main.go . 
RUN go build -o server main.go
CMD ["./server"]