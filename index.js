const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5000;

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    database: 'taskmanager',
    password: 'Bijan12345'
})
db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log("database connected successfully")
})

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

app.post("/registration", async (req, res) => {
    const users = {
        First_Name: req.body.first_Name,
        Last_Name: req.body.last_Name,
        Username: req.body.username,
        Email: req.body.email,
        Password: req.body.password
    }

    try {
        const hashedPassword = await bcrypt.hash(users.Password, saltRounds);

        const query = 'INSERT INTO `taskmanager`.`user` (`First_Name`, `Last_Name`, `Username`, `Email`, `Password`) VALUES (?);'

        const value = [
            users.First_Name,
            users.Last_Name,
            users.Username,
            users.Email,
            hashedPassword
        ]

        console.log(query);

        db.query(query, [value], (err, data) => {
            if (err) {
                console.log(err);
                return res.status(500).json("error while submitting data");
            } else {
                return res.status(201).json("user added successfully");
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json("Internal server error");
    }
})

app.post("/login", (req, res) => {
    const userData = {
        Email: req.body.email,
        Password: req.body.password
    }

    try {
        const query = 'SELECT * FROM `taskmanager`.`user` WHERE Email = ?'

        db.query(query, [userData.Email], async (err, data) => {
            if (err) {
                return res.json(err)
            }
            if (data.length > 0) {
                const user = data[0]
                const passwordMatches = await validatePassword(userData.Password, user.Password);
                if (passwordMatches) {
                    return res.send(data);
                } else {
                    return res.send("Invalid password");
                }
            } else {
                return res.send("usernot found");
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json("Internal server error");
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})


