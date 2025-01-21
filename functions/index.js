const functions = require("firebase-functions");
const axios = require("axios");
const qs = require("qs");

const UPS_API_URL = "https://onlinetools.ups.com/rest/Ship";
const UPS_OAUTH_URL = "https://wwwcie.ups.com/security/v1/oauth/token";
const CLIENT_ID = HASHTOKEN;
const CLIENT_SECRET = HASHTOKEN;

exports.createUpsOrder = functions.https.onRequest(async (req, res) => {
  try {
    const orderDetails = req.body;

    const tokenResponse = await axios.post(
      UPS_OAUTH_URL,
      qs.stringify({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const requestBody = {
      ShipmentRequest: {
        Request: {
          TransactionReference: {
            CustomerContext: "Your Customer Context"
          },
          RequestAction: "Ship",
          RequestOption: "nonvalidate"
        },
        Shipment: {
          Shipper: {
            Name: "Shipper Name",
            ShipperNumber: "Shipper Number",
            Address: {
              AddressLine: "Address Line",
              City: "City",
              StateProvinceCode: "State",
              PostalCode: "Postal Code",
              CountryCode: "Country"
            }
          },
          ShipTo: {
            Name: "Recipient Name",
            Address: {
              AddressLine: "Address Line",
              City: "Tucson",
              StateProvinceCode: "State",
              PostalCode: "Postal Code",
              CountryCode: "Country"
            }
          },
          ShipFrom: {
            Name: "Sender Name",
            Address: {
              AddressLine: "Address Line",
              City: "City",
              StateProvinceCode: "State",
              PostalCode: "Postal Code",
              CountryCode: "Country"
            }
          },
          PaymentInformation: {
            ShipmentCharge: {
              Type: "01",
              BillShipper: {
                AccountNumber: "Shipper Number"
              }
            }
          },
          Service: {
            Code: "03",
            Description: "Ground"
          },
          Package: [
            {
              Description: "Package Description",
              Packaging: {
                Code: "02",
                Description: "Package"
              },
              Dimensions: {
                UnitOfMeasurement: {
                  Code: "IN"
                },
                Length: "5",
                Width: "5",
                Height: "5"
              },
              PackageWeight: {
                UnitOfMeasurement: {
                  Code: "LBS"
                },
                Weight: "1"
              }
            }
          ]
        },
        LabelSpecification: {
          LabelImageFormat: {
            Code: "GIF"
          },
          HTTPUserAgent: "Mozilla/4.5"
        }
      }
    };

    const response = await axios.post(UPS_API_URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.status(200).send(response.data);
  } catch (error) {
    console.error("Error creating UPS order:", error.response ? error.response.data : error.message);
    res.status(500).send("Error creating UPS order");
  }
});
