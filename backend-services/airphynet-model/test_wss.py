import socket
import ssl

broker = "f8d02a91.ala.asia-southeast1.emqxsl.com"
port = 8084

print(f"Connecting to {broker}:{port}...")
context = ssl.create_default_context()
context.check_hostname = False
context.verify_mode = ssl.CERT_NONE

try:
    sock = socket.create_connection((broker, port), timeout=10)
    ssock = context.wrap_socket(sock, server_hostname=broker)
    print("SSL Connection Successful!")
    
    # Send minimal WebSocket Handshake
    req = (
        f"GET /mqtt HTTP/1.1\r\n"
        f"Host: {broker}:{port}\r\n"
        f"Upgrade: websocket\r\n"
        f"Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n"
        f"Sec-WebSocket-Version: 13\r\n"
        f"\r\n"
    )
    ssock.sendall(req.encode())
    print("Sent WebSocket Handshake.")
    
    response = ssock.recv(1024)
    print("Received Response:")
    print(response.decode(errors='replace'))
    
    ssock.close()
    print("Test Complete.")

except Exception as e:
    print(f"FAILED: {e}")
