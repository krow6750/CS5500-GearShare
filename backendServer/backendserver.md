# Backendsever API Documentation

---

## Dependencies Needed
To set up and run this server, ensure the following dependencies are installed:
```bash
npm install express dotenv <del>mongoes</del>
```

---

## Setup Instructions
1. Ensure a `.env` file in the root directory with the following variables:
    ```
    PORT=8000
    AIRTABLE_API_KEY= airtable_api_key
    ```
2. Start the server:
    ```bash
    npm run sever
    ```
4. The server will run on `http://localhost:8000` by default.

---

## Usage Example
Use the `/sync` function to fetch and sync repair ticket data with a `POST` request:
```javascript
const axios = require("axios");

async function syncData() {
  const response = await axios.post('http://localhost:8000/sync');
  console.log(response.data);
}

syncData();
```

---

## API Endpoints

### 1. Fetch Repair Tickets
- **URL**: `/airtable-data`
- **Method**: `GET`
- **Description**: Retrieves all repair ticket data from the Airtable database.
- **Response Example**:
    ```json
    [
      {
        "id": "rectKCIVwm6CrKh3s",
        "firstName": "John",
        "lastName": "Doe",
        "itemType": "Jacket",
        "damageDescription": "Torn sleeve",
        "repairCost": 300,
        "status": "In Progress",
        "dateSubmitted": "2024-10-12",
        "photoURL": "http://test.com/photo.jpg"
      }
    ]
    ```

---

### 2. Update Repair Tickets
- **URL**: `/update-airtable-entry/:id`
- **Method**: `PUT`
- **Description**: Updates an existing repair ticket record in Airtable.
- **Path Parameters**:
  - `:id` (string): The Airtable record ID (must start with `rec`).
- **Request Body Example**:
    ```json
    {
      "Status": "In Progress",
      "Repair Cost": 150
    }
    ```
- **Response Example**:
    ```json
    {
      "message": "Record updated successfully",
      "updatedRecord": {
        "Status": "In Progress",
        "Repair Cost": 150
      }
    }
    ```

---

### 3. Manual Sync
- **URL**: `/sync`
- **Method**: `POST`
- **Description**: Fetches and logs all repair ticket data for synchronization purposes.
- **Response Example**:
    ```json
    {
      "message": "Sync successful",
      "recordCount": 10,
      ...
    }
    ```

---

### 4. Fetch Users
- **URL**: `/users`
- **Method**: `GET`
- **Description**: Retrieves all user data from the Airtable "Users" table.
- **Response Example**:
    ```json
    [
      {
        "id": "reclUalEsdSKo2pxG",
        "lastName": "User",
        "firstName": "Test",
        "email": "testuser@example.com",
        "password": "password",
        "authentication": "ordinary"
      }
    ]
    ```

---

### 5. Register User
- **URL**: `/register`
- **Method**: `POST`
- **Description**: Registers a new user in the Airtable "Users" table.
- **Request Body Example**:
    ```json
    {
      "firstName": "User",
      "lastName": "Test",
      "email": "testuser@example.com",
      "password": "password"
    }
    ```
- **Response Example**:
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "First Name": "User",
        "Last Name": "Test",
        "Email": "testuser@example.com",
        "Authentication": "ordinary"
      }
    }
    ```

---

### 6. Update User
- **URL**: `/update-user/:id`
- **Method**: `PUT`
- **Description**: Updates an existing user record.
- **Path Parameters**:
  - `:id` (string): The Airtable record ID (must start with `rec`).
- **Request Body Example**:
    ```json
    {
      "Email": "newemail@example.com",
      "Password": "newpassword"
    }
    ```
- **Response Example**:
    ```json
    {
      "message": "User updated successfully",
      "updatedUser": {
        "Email": "newemail@example.com",
        "Password": "newpassword"
      }
    }
    ```

---

### 7. Delete User
- **URL**: `/delete-user/:id`
- **Method**: `DELETE`
- **Description**: Deletes a user record from the Airtable "Users" table.
- **Path Parameters**:
  - `:id` (string): The Airtable record ID (must start with `rec`).
- **Response Example**:
    ```json
    {
      "message": "User deleted successfully"
    }
    ```

---



