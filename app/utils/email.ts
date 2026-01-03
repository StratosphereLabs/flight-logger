import nodemailer from 'nodemailer';
import { type SentMessageInfo } from 'nodemailer/lib/smtp-transport';

export interface SendEmailOptions {
  address: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface PasswordResetEmailOptions {
  resetLink: string;
}

export const sendEmail = async ({
  address,
  subject,
  text,
  html,
}: SendEmailOptions): Promise<SentMessageInfo | null> => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: parseInt(process.env.MAILTRAP_PORT ?? '', 10),
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: '"Flight Logger" <noreply@flightlogger.stratospherelabs.io>',
    to: address,
    subject,
    text,
    html,
  });
  return info;
};

export const getResetEmail = ({
  resetLink,
}: PasswordResetEmailOptions): string => `
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <style>
      @media only screen and (max-width: 600px) {
        .inner-body {
          width: 100% !important;
        }

        .footer {
          width: 100% !important;
        }
      }

      @media only screen and (max-width: 500px) {
        .button {
          width: 100% !important;
        }
      }
    </style>
  </head>
  <body
    style="
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
        'Segoe UI Symbol';
      position: relative;
      -webkit-text-size-adjust: none;
      background-color: #ffffff;
      color: #718096;
      height: 100%;
      line-height: 1.4;
      margin: 0;
      padding: 0;
      width: 100% !important;
    "
  >
    <table
      class="wrapper"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
          'Segoe UI Symbol';
        position: relative;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
        -premailer-width: 100%;
        background-color: #edf2f7;
        margin: 0;
        padding: 0;
        width: 100%;
      "
    >
      <tbody>
        <tr>
          <td
            align="center"
            style="
              box-sizing: border-box;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                'Segoe UI Emoji', 'Segoe UI Symbol';
              position: relative;
            "
          >
            <table
              class="content"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                  Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                  'Segoe UI Emoji', 'Segoe UI Symbol';
                position: relative;
                -premailer-cellpadding: 0;
                -premailer-cellspacing: 0;
                -premailer-width: 100%;
                margin: 0;
                padding: 0;
                width: 100%;
              "
            >
              <tbody>
                <tr>
                  <td
                    class="header"
                    style="
                      box-sizing: border-box;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                      position: relative;
                      padding: 25px 0;
                      text-align: center;
                    "
                  >
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="${process.env.VITE_APP_URL ?? 'http://localhost:8000'}"
                      style="
                        box-sizing: border-box;
                        font-family: -apple-system, BlinkMacSystemFont,
                          'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                          'Apple Color Emoji', 'Segoe UI Emoji',
                          'Segoe UI Symbol';
                        position: relative;
                        color: #3d4852;
                        font-size: 19px;
                        font-weight: bold;
                        text-decoration: none;
                        display: inline-block;
                      "
                    >
                      FlightLogger
                    </a>
                  </td>
                </tr>

                <!-- Email Body -->
                <tr>
                  <td
                    class="body"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      box-sizing: border-box;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                      position: relative;
                      -premailer-cellpadding: 0;
                      -premailer-cellspacing: 0;
                      -premailer-width: 100%;
                      background-color: #edf2f7;
                      border-bottom: 1px solid #edf2f7;
                      border-top: 1px solid #edf2f7;
                      margin: 0;
                      padding: 0;
                      width: 100%;
                    "
                  >
                    <table
                      class="inner-body"
                      align="center"
                      width="570"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        box-sizing: border-box;
                        font-family: -apple-system, BlinkMacSystemFont,
                          'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                          'Apple Color Emoji', 'Segoe UI Emoji',
                          'Segoe UI Symbol';
                        position: relative;
                        -premailer-cellpadding: 0;
                        -premailer-cellspacing: 0;
                        -premailer-width: 570px;
                        background-color: #ffffff;
                        border-color: #e8e5ef;
                        border-radius: 2px;
                        border-width: 1px;
                        box-shadow: 0 2px 0 rgba(0, 0, 150, 0.025),
                          2px 4px 0 rgba(0, 0, 150, 0.015);
                        margin: 0 auto;
                        padding: 0;
                        width: 570px;
                      "
                    >
                      <!-- Body content -->
                      <tbody>
                        <tr>
                          <td
                            class="content-cell"
                            style="
                              box-sizing: border-box;
                              font-family: -apple-system, BlinkMacSystemFont,
                                'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                                'Apple Color Emoji', 'Segoe UI Emoji',
                                'Segoe UI Symbol';
                              position: relative;
                              max-width: 100vw;
                              padding: 32px;
                            "
                          >
                            <h1
                              style="
                                box-sizing: border-box;
                                font-family: -apple-system, BlinkMacSystemFont,
                                  'Segoe UI', Roboto, Helvetica, Arial,
                                  sans-serif, 'Apple Color Emoji',
                                  'Segoe UI Emoji', 'Segoe UI Symbol';
                                position: relative;
                                color: #3d4852;
                                font-size: 18px;
                                font-weight: bold;
                                margin-top: 0;
                                text-align: left;
                              "
                            >
                              Hello!
                            </h1>
                            <p
                              style="
                                box-sizing: border-box;
                                font-family: -apple-system, BlinkMacSystemFont,
                                  'Segoe UI', Roboto, Helvetica, Arial,
                                  sans-serif, 'Apple Color Emoji',
                                  'Segoe UI Emoji', 'Segoe UI Symbol';
                                position: relative;
                                font-size: 16px;
                                line-height: 1.5em;
                                margin-top: 0;
                                text-align: left;
                              "
                            >
                              Please click the button below to reset your password.
                            </p>
                            <table
                              class="action"
                              align="center"
                              width="100%"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                box-sizing: border-box;
                                font-family: -apple-system, BlinkMacSystemFont,
                                  'Segoe UI', Roboto, Helvetica, Arial,
                                  sans-serif, 'Apple Color Emoji',
                                  'Segoe UI Emoji', 'Segoe UI Symbol';
                                position: relative;
                                -premailer-cellpadding: 0;
                                -premailer-cellspacing: 0;
                                -premailer-width: 100%;
                                margin: 30px auto;
                                padding: 0;
                                text-align: center;
                                width: 100%;
                              "
                            >
                              <tbody>
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      box-sizing: border-box;
                                      font-family: -apple-system,
                                        BlinkMacSystemFont, 'Segoe UI', Roboto,
                                        Helvetica, Arial, sans-serif,
                                        'Apple Color Emoji', 'Segoe UI Emoji',
                                        'Segoe UI Symbol';
                                      position: relative;
                                    "
                                  >
                                    <table
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        box-sizing: border-box;
                                        font-family: -apple-system,
                                          BlinkMacSystemFont, 'Segoe UI', Roboto,
                                          Helvetica, Arial, sans-serif,
                                          'Apple Color Emoji', 'Segoe UI Emoji',
                                          'Segoe UI Symbol';
                                        position: relative;
                                      "
                                    >
                                      <tbody>
                                        <tr>
                                          <td
                                            align="center"
                                            style="
                                              box-sizing: border-box;
                                              font-family: -apple-system,
                                                BlinkMacSystemFont, 'Segoe UI',
                                                Roboto, Helvetica, Arial,
                                                sans-serif, 'Apple Color Emoji',
                                                'Segoe UI Emoji',
                                                'Segoe UI Symbol';
                                              position: relative;
                                            "
                                          >
                                            <table
                                              border="0"
                                              cellpadding="0"
                                              cellspacing="0"
                                              role="presentation"
                                              style="
                                                box-sizing: border-box;
                                                font-family: -apple-system,
                                                  BlinkMacSystemFont, 'Segoe UI',
                                                  Roboto, Helvetica, Arial,
                                                  sans-serif,
                                                  'Apple Color Emoji',
                                                  'Segoe UI Emoji',
                                                  'Segoe UI Symbol';
                                                position: relative;
                                              "
                                            >
                                              <tbody>
                                                <tr>
                                                  <td
                                                    style="
                                                      box-sizing: border-box;
                                                      font-family: -apple-system,
                                                        BlinkMacSystemFont,
                                                        'Segoe UI', Roboto,
                                                        Helvetica, Arial,
                                                        sans-serif,
                                                        'Apple Color Emoji',
                                                        'Segoe UI Emoji',
                                                        'Segoe UI Symbol';
                                                      position: relative;
                                                    "
                                                  >
                                                    <a
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      href="${resetLink}"
                                                      class="button button-primary"
                                                      style="
                                                        box-sizing: border-box;
                                                        font-family: -apple-system,
                                                          BlinkMacSystemFont,
                                                          'Segoe UI', Roboto,
                                                          Helvetica, Arial,
                                                          sans-serif,
                                                          'Apple Color Emoji',
                                                          'Segoe UI Emoji',
                                                          'Segoe UI Symbol';
                                                        position: relative;
                                                        -webkit-text-size-adjust: none;
                                                        border-radius: 4px;
                                                        color: #fff;
                                                        display: inline-block;
                                                        overflow: hidden;
                                                        text-decoration: none;
                                                        background-color: #2d3748;
                                                        border-bottom: 8px solid
                                                          #2d3748;
                                                        border-left: 18px solid
                                                          #2d3748;
                                                        border-right: 18px solid
                                                          #2d3748;
                                                        border-top: 8px solid
                                                          #2d3748;
                                                      "
                                                      >Reset Password</a
                                                    >
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p
                              style="
                                box-sizing: border-box;
                                font-family: -apple-system, BlinkMacSystemFont,
                                  'Segoe UI', Roboto, Helvetica, Arial,
                                  sans-serif, 'Apple Color Emoji',
                                  'Segoe UI Emoji', 'Segoe UI Symbol';
                                position: relative;
                                font-size: 16px;
                                line-height: 1.5em;
                                margin-top: 0;
                                text-align: left;
                              "
                            >
                              If you did not create an account, no further
                              action is required.
                            </p>
                            <p
                              style="
                                box-sizing: border-box;
                                font-family: -apple-system, BlinkMacSystemFont,
                                  'Segoe UI', Roboto, Helvetica, Arial,
                                  sans-serif, 'Apple Color Emoji',
                                  'Segoe UI Emoji', 'Segoe UI Symbol';
                                position: relative;
                                font-size: 16px;
                                line-height: 1.5em;
                                margin-top: 0;
                                text-align: left;
                              "
                            >
                              Regards,<br />
                              Stratosphere Labs
                            </p>

                            <table
                              class="subcopy"
                              width="100%"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                box-sizing: border-box;
                                font-family: -apple-system, BlinkMacSystemFont,
                                  'Segoe UI', Roboto, Helvetica, Arial,
                                  sans-serif, 'Apple Color Emoji',
                                  'Segoe UI Emoji', 'Segoe UI Symbol';
                                position: relative;
                                border-top: 1px solid #e8e5ef;
                                margin-top: 25px;
                                padding-top: 25px;
                              "
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      box-sizing: border-box;
                                      font-family: -apple-system,
                                        BlinkMacSystemFont, 'Segoe UI', Roboto,
                                        Helvetica, Arial, sans-serif,
                                        'Apple Color Emoji', 'Segoe UI Emoji',
                                        'Segoe UI Symbol';
                                      position: relative;
                                    "
                                  >
                                    <p
                                      style="
                                        box-sizing: border-box;
                                        font-family: -apple-system,
                                          BlinkMacSystemFont, 'Segoe UI', Roboto,
                                          Helvetica, Arial, sans-serif,
                                          'Apple Color Emoji', 'Segoe UI Emoji',
                                          'Segoe UI Symbol';
                                        position: relative;
                                        line-height: 1.5em;
                                        margin-top: 0;
                                        text-align: left;
                                        font-size: 14px;
                                      "
                                    >
                                      If you're having trouble clicking the
                                      "Reset Password" button, copy and
                                      paste the URL below into your web browser:
                                      <span
                                        class="break-all"
                                        style="
                                          box-sizing: border-box;
                                          font-family: -apple-system,
                                            BlinkMacSystemFont, 'Segoe UI',
                                            Roboto, Helvetica, Arial, sans-serif,
                                            'Apple Color Emoji',
                                            'Segoe UI Emoji', 'Segoe UI Symbol';
                                          position: relative;
                                          word-break: break-all;
                                        "
                                        ><a
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          href="${resetLink}"
                                          style="
                                            box-sizing: border-box;
                                            font-family: -apple-system,
                                              BlinkMacSystemFont, 'Segoe UI',
                                              Roboto, Helvetica, Arial,
                                              sans-serif, 'Apple Color Emoji',
                                              'Segoe UI Emoji',
                                              'Segoe UI Symbol';
                                            position: relative;
                                            color: #3869d4;
                                          "
                                          >${resetLink}</a
                                        ></span
                                      >
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      box-sizing: border-box;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                      position: relative;
                    "
                  >
                    <table
                      class="footer"
                      align="center"
                      width="570"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        box-sizing: border-box;
                        font-family: -apple-system, BlinkMacSystemFont,
                          'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                          'Apple Color Emoji', 'Segoe UI Emoji',
                          'Segoe UI Symbol';
                        position: relative;
                        -premailer-cellpadding: 0;
                        -premailer-cellspacing: 0;
                        -premailer-width: 570px;
                        margin: 0 auto;
                        padding: 0;
                        text-align: center;
                        width: 570px;
                      "
                    >
                      <tbody>
                        <tr>
                          <td
                            class="content-cell"
                            align="center"
                            style="
                              box-sizing: border-box;
                              font-family: -apple-system, BlinkMacSystemFont,
                                'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                                'Apple Color Emoji', 'Segoe UI Emoji',
                                'Segoe UI Symbol';
                              position: relative;
                              max-width: 100vw;
                              padding: 32px;
                            "
                          >
                            <p
                              style="
                                box-sizing: border-box;
                                font-family: -apple-system, BlinkMacSystemFont,
                                  'Segoe UI', Roboto, Helvetica, Arial,
                                  sans-serif, 'Apple Color Emoji',
                                  'Segoe UI Emoji', 'Segoe UI Symbol';
                                position: relative;
                                line-height: 1.5em;
                                margin-top: 0;
                                color: #b0adc5;
                                font-size: 12px;
                                text-align: center;
                              "
                            >
                              © 2022 Stratosphere Labs. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
