Implement secure transaction signing on client side

This update modifies the client and server-side logic to handle signed transactions securely. The client now signs the transaction using the user's connected wallet, and the server processes this signed transaction without requiring the gas sponsor's private key.
