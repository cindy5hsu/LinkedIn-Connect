# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o linkedin-integration-app .

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates sqlite

WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/linkedin-integration-app .

# Copy static files
COPY --from=builder /app/client ./client
COPY --from=builder /app/index.html .
COPY --from=builder /app/.env .

# Expose port
EXPOSE 5000

# Run the binary
CMD ["./linkedin-integration-app"]