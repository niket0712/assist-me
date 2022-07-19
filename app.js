const express = require("express"),
    bodyParser = require("body-parser"),
    path = require("path"),
    session = require('express-session'),
    mysql = require("mysql2"),
    bcrypt = require("bcrypt"),
    flash = require('connect-flash'),
    app = express();

require('dotenv').config();
const { PASSWORD, DATABASE, USER, HOST } = process.env;
let studId, teacherId, teacherSubId, quesId;

app.use('/public', express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(flash());

app.use(session({
    secret: "Assist Me",
    resave: false,
    saveUninitialized: false
}));

// DATABASE CONNECTION
let con = mysql.createConnection({
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DATABASE,
});

con.connect((err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Connected");
    }
});

// app.get("/", (req, res) => {
//     res.render("home.ejs");
// });

app.get("/home", (req, res) => {
    res.render("home.ejs");
});


// Student Registration

app.get("/studentsignup", (req, res) => {
    res.render("studentsignup");
});

app.post("/studentsignup", (req, res) => {
    const { firstname, lastname, gender, dob, email, password } = req.body;
    const user = {
        firstname,
        lastname,
        gender,
        dob,
        email,
        password
    }


    con.query("INSERT INTO student set ?", user, (err, result) => {
        if (err) {
            console.log(err);
            req.flash("error", err);
            res.redirect("studentsignup");
            return;
        }
        console.log("Registered successfully");
        res.redirect("/studentlogin");
    });
});



// STUDENT LOGIN
app.get("/studentlogin", (req, res) => {
    res.render("studentlogin");
});


// STUDENT AUTHENTICATION
app.post("/studentlogin", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;


    con.query('SELECT Id,Firstname FROM student WHERE email = ? AND password = ? ', [email, password], function (err, result) {
        if (err) throw err
        // if user not found

        studId = result[0].Id;
        console.log(studId);

        if (result.length <= 0) {
            req.flash('error', 'Please correct enter email and Password!')
            res.redirect('/login');
        }
        else {
            sess = req.session;
            sess.loggedin = true;
            sess.name = result[0].Firstname;
            console.log(sess.name);
            res.redirect("/StudentSection");
        }
    });
});





// STUDENT SECTION

app.get("/StudentSection", (req, res) => {
    con.query("SELECT Id,Question FROM questions where student_id = ?", [studId], (err, results) => {
        res.render("StudentSection", {
            results: results,
            name: sess.name
        });
    });

});


app.get("/StudentQuestion", (req, res) => {
    res.render("StudentQuestion");
});

app.post("/StudentQuestion", (req, res) => {
    question = {
        subject_id: req.body.subject,
        student_id: stud_id,
        Question: req.body.question
    }

    con.query("INSERT INTO questions SET ?", [question], (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Successfully inserted in question table");
            res.redirect("/StudentSection");
        }
    });
});

// QUESTIONS ROUTE

app.get("/StudentSection/Question:id", (req, res) => {
    requested_id = req.params.id;

    con.query("SELECT answer FROM answers WHERE question_id =?", [requested_id], (err, answers) => {

        con.query("SELECT Question from questions WHERE ID = ?", [requested_id], (err, question) => {

            console.log(question);
            res.render("Question", {
                answers: answers,
                question: question
            });

        });

    });
});




// ********************************* TEACHER SECTION *****************************//

// TEACHER LOGIN
app.get("/teacherlogin", (req, res) => {
    res.render("teacherlogin");
});

// TEACHER REGISTRATION 

app.get("/teachersignup", (req, res) => {
    res.render("teachersignup");
});

app.post("/teachersignup", (req, res) => {
    const { firstname, lastname, gender, dob, subject_id, email, password } = req.body;
    const user = {
        firstname,
        lastname,
        gender,
        dob,
        subject_id,
        email,
        password
    }

    con.query("INSERT INTO teacher set ?", user, (err, result) => {
        if (err) {
            console.log(err);
            req.flash("error", err);
            res.redirect("teachersignup");
            return;
        }
        console.log("Registered successfully");
        res.redirect("/teacherlogin");
    });
});



// TEACHER AUTHENTICATION

app.post("/teacherlogin", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;


    con.query('SELECT Id,Firstname,subject_id FROM teacher WHERE email = ? AND password = ? ', [email, password], function (err, result) {
        if (err) throw err
        // if user not found

        teacherId = result[0].Id;
        teacherSubId = result[0].subject_id;
        // console.log(teacherSubId);

        if (result.length <= 0) {
            req.flash('error', 'Please correct enter email and Password!')
            res.redirect('/login');
        }
        else {
            sess = req.session;
            sess.loggedin = true;
            sess.name = result[0].Firstname;
            console.log(sess.name);
            res.redirect("/TeacherSection");
        }
    });
});



// TEACHER SECTION

app.get("/TeacherSection", (req, res) => {
    con.query("SELECT Id,Question FROM questions where subject_id = ?", [teacherSubId], (err, results) => {
        res.render("TeacherSection", {
            results: results,
            name: sess.name,

        });
    });

});

app.get("/TeacherSection/Answer:id", (req, res) => {

    requested_id = req.params.id;

    con.query("SELECT Id,Question from questions WHERE ID = ?", [requested_id], (err, question) => {

        quesId = question[0].Id;
        console.log(question);

        con.query("Select answer from answers WHERE question_id = ? AND teacher_id = ?", [quesId, teacherId], (err, answers) => {

            res.render("Answer", {
                answers: answers,
                question: question,
                quesId: quesId
            });
        });
    });
});

app.post("/TeacherSection/Answer:id", (req, res) => {

    answer_data = {
        question_id : req.params.id,
         teacher_id : teacherId,
        answer: req.body.ans
    }

    console.log(answer_data);
    con.query("INSERT INTO answers set ?" , answer_data , (err,result)=>{
        if (err){
          console.log(err);
        }
        else{
            console.log("Successfully inserted in answer table");
            res.redirect("/TeacherSection/Answer" + quesId);
        }
    });
});



// LOGOUT
app.post("/logout", (req, res) => {
    sess.destroy();
    console.log("Logged out");
    req.flash('success', 'Login Again Here');
    res.redirect("/");
});

app.listen(3000, (req, res) => {
    console.log("Server running on port 3000");
});


