const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const login_db = require("../data/login_db");
const nodemailer = require("nodemailer");
const emailValidator = require("deep-email-validator");
const randToken = require("rand-token");
const { token } = require("morgan");
const { LOADIPHLPAPI } = require("dns");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // if (!email || !password) {
    //   return res.status(400).render("giriş_yap", {
    //     msg: "Lütfen e-mail ve şifrenizi giriniz",
    //     msg_type: "error",
    //   });

    //EĞER FRONT-END İNPUT ALANLARI REQUİRED ATTRIBUTE İÇERMİYORSA BU KOD GEREKLDİR.

    // }

    const user = await login_db.query(`select * from users where email = ?`, [
      email,
    ]);

    //console.log(user[0]);

    //console.log(user[0][0]) ;
    if (user[0].length === 0) {
      return res.status(401).render("giriş_yap", {
        msg: "Sistemde kaydınız bulunamadı",
        msg_type: "error",
      });
    }
    const passwordMatch = await bcrypt.compare(password, user[0][0].PASS);
    if (!passwordMatch) {
      return res.status(401).render("giriş_yap", {
        msg: "Emailiniz veya Şifreniz hatalı",
        msg_type: "error",
      });
    } else {
      const id = user[0][0].ID;
      const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      //console.log("The Token is " + token);
      const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };
      res.cookie("joes", token, cookieOptions);
      res.status(200).redirect("/anasayfa");
    }
  } catch (error) {
    console.log(error);
  }
};
exports.register = async (req, res) => {
  //console.log(req.body);
  const {
    name,
    surname,
    email,
    company,
    department,
    title,
    password,
    confirm_password,
  } = req.body;
  let r_token = randToken.generate(20);

  const user = await login_db.query(`select * from users where email = ?`, [
    email,
  ]);

  if (user[0].length > 0) {
    return res.render("kayıt_ol", {
      msg: "Bu email daha önce kullanılmış",
      msg_type: "error",
    });
  } else if (password !== confirm_password) {
    return res.render("kayıt_ol", {
      msg: "Şifreler eşleşmiyor",
      msg_type: "error",
    });
  } else {
    let hashedPassword = await bcrypt.hash(password, 8);
    let set = await login_db.query("insert into users set ?", {
      name: name,
      surname: surname,
      email: email,
      company: company,
      department: department,
      title: title,
      role: "basic",
      pass: hashedPassword,
      token: r_token,
    });
    res.render("kayıt_ol", {
      msg: "Başarıyla kaydoldunuz. Artık sisteme giriş yapabilirsiniz",
      msg_type: "good",
    });
  }
  const transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_NAME,
    to: "orcungok20@gmail.com",
    subject: "Üyeliğin Başarıyla Oluşturuldu",
    text: `Fikrim Geldi'ye Hoş Geldin ${name}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.joes) {
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.joes,
        process.env.JWT_SECRET
      );

      const user = await login_db.query(`select * from users where id = ?`, [
        [decode.id],
      ]);

      //console.log(user[0]);

      if (!user[0]) {
        return next();
      }
      req.user = user[0][0];
      //console.log(req.user);
      return next();
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
};

exports.logout = async (req, res) => {
  res.cookie("joes", "logout", {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });
  res.status(200).redirect("/");
};

exports.forgot_password = async (req, res) => {
  try {
    const { email } = req.body;

    const currentEmail = await login_db.query(
      `select email from users where email=?`,
      [email]
    );
    //console.log(currentEmail[0][0].email);
    if (currentEmail[0].length > 0) {
      const token = await login_db.query(
        `select token from users where email=?`,
        [email]
      );
      //console.log(token[0][0].token);

      if (token[0].length > 0) {
        const transporter = nodemailer.createTransport({
          service: "outlook",
          auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_PASS,
          },
        });

        let changeEmail = currentEmail[0][0].email;
        let changeToken = token[0][0].token;

        const mailOptions = {
          from: process.env.EMAIL_NAME,
          to: `${changeEmail}`,
          subject: "Fikrim Geldi Şifre Sıfırlama",
          html:
            '<p>Merhaba,şifrenizi güncellemek için lütfen <a href="http://localhost:3000/sifremi_guncelle?token=' +
            changeToken +
            '">Buradaki bağlantıya</a> tıklayınız.</p>',
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      }

      return res.render("şifremi_unuttum", {
        msg: "Şifre değişikliği için e-mailinize bir bağlantı gönderilmiştir. Bu sayfayı kapatabilirsiniz.",
        msg_type: "good",
      });
    } else {
      return res.render("şifremi_unuttum", {
        msg: "Girmiş olduğunuz e-mail sistemde kayıtlı değildir.",
        msg_type: "error",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.update_password = async (req, res) => {
  const {new_password, new_password_confirm} = req.body;

  let key_array = Object.keys(req.body);
  const token = key_array[2];
  console.log(token) ;

  if (new_password !== new_password_confirm) {
    res.render("şifremi_güncelle", {
      msg: "Şifreler eşleşmiyor",
      msg_type: "error",
    });
  } else {
    let r_token = randToken.generate(20);
    let new_hashedPassword = await bcrypt.hash(new_password, 8);

    let setPass  =  await login_db.query(`update users set pass='${new_hashedPassword}'where token='${token}'`); 
    res.render("şifremi_güncelle", {
      msg: "Şifreniz başarıyla değiştirildi!",
      msg_type: "good",
    });

    let setToken = await login_db.query(`update users set token='${r_token}'where PASS='${new_hashedPassword}'`);
  
  }
};
