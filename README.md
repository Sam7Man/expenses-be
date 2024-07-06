
## Personal Expenses API
This API provides endpoints for managing personal expenses, including authentication, expense management, requests, sessions, and documentation using Swagger.

### Features
* User authentication and authorization (only using access code, no username or password).
* Multi-role with role-based access control.
* CRUD operations for managing expenses.
* Handling access requests and approvals.
* Managing active and revoked user sessions.
* Comprehensive API documentation with Swagger.

### Technologies Used
* [Node.js](https://nodejs.org/en/) 20.15
* [Express.js](https://www.npmjs.com/package/express) 4.19
* MongoDB (or PostgreSQL)
* Swagger (for API documentation)
* Helmet (for HTTP headers security)
* Express Rate Limit (for rate limiting requests)
* CORS (for handling Cross-Origin Resource Sharing)


### Getting Started
To get started with this project, follow these steps:

#### Prerequisites
* Install [Node.js](https://nodejs.org/en/download/package-manager) on your local machine.
* [MongoDB](https://www.mongodb.com/docs/manual/installation/) installed and running (or use [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud-based MongoDB or the GUI [MongoDB Compass](https://www.mongodb.com/try/download/compass)).

### Installation
* Clone the repository:
```
git clone https://github.com/Sam7Man/expenses-be.git
cd expenses-be-main
```

* Install dependencies:
```
npm install
```

* Set up environment variables:
Run this command to create `.env` file :
```
cp .env.example .env
```
or create new `.env` file by running this command:
```
touch .env
```
Customize the existing `.env` file as needed.

* User creation:
Create default user by running this command:
```
npm run createUser
```
This will create you 3 users with 3 different roles (`admin`, `family`, and `viewer`).

* Start the server:
```
npm start
```
The server will run on port 3000 (or the port defined in your `.env` file). 


## API Reference
Explore the API endpoints using Swagger documentation:
* Swagger UI: Navigate to http://localhost:3000/api/docs after starting the server to view and interact with API documentation.


### Endpoint

* #### Auth
```http
  POST /api/auth/login
```

| Parameter | Type     | Description                     |
| :-------- | :------- | :------------------------------ |
| `account` | `string` | **Required**. Your account code |

> #### Response:
| Status | Type     | Body                |
| :----- | :------- | :------------------ |
| `200 OK` | `json` | `{"token":"string"}`|



```http
   POST /api/auth/logout
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| - | - | Invalidate token |


## Screenshots

![App Screenshot](https://github.com/Sam7Man/expenses-be/blob/main/Swagger-UI.png?raw=true)


## Contributing
Contributions are welcome! Feel free to open issues or pull requests for any improvements or features you'd like to see added.


## License
This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).