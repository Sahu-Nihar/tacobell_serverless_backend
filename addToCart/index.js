const sql = require('mysql2');
const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');

exports.handler = async (event) => {
    let cart_json = null;
    let userId = null;
    try {
        cart_json = JSON.parse(event.body);
        userId = event.pathParameters.userid;

        // console.log('Cart json:', cart_json);
        // console.log('User id:', userId);

        // create the connection to database
        const connection = await mysql.createConnection({
            host: '18.225.10.147',
            user: 'tacobell',
            password: 'password',
            database: 'tacobell'
        });

        console.log('db client response:', connection);

        let verifiedArr = [];
        let rejectedArr = [];

        for (let index in cart_json) {
            let validateCartObj = validateCartDetails(cart_json[index]);

            if (!validateCartObj.success) {
                let rejectedObj = {
                    ...cart_json[index],
                    message: validateCartObj.message
                };

                rejectedArr = [...rejectedArr, rejectedObj];
            }
            else {
                let uploadObj = {
                    ...validateCartObj.data,
                    userId: userId
                }

                let duplicateIndex = verifiedArr.findIndex(item => item.name == uploadObj.name);

                if (duplicateIndex > -1) {
                    verifiedArr[duplicateIndex].quantity += 1;
                    verifiedArr[duplicateIndex].price = verifiedArr[duplicateIndex].quantity * uploadObj.price;
                }

                else {
                    verifiedArr = [...verifiedArr, uploadObj];
                }
            }
        }

        // console.log('verified array:', verifiedArr);
        // console.log('rejected array:', rejectedArr);

        let createcart = await createCartDetails(verifiedArr, rejectedArr, connection);

        // console.log('Callback function response:', createcart);

        if (!createcart.success) return {
            statusCode: 404,
            body: JSON.stringify(createcart)
        };

        return {
            statusCode: 200,
            body: JSON.stringify(createcart)
        };
    }
    catch (error) {

        const response = {
            statusCode: 400,
            body: JSON.stringify(error),
        };
        return response;
    }
};

const validateCartDetails = (cartObject) => {
    const { name, price } = cartObject;

    if (!name || !price) return {
        success: false,
        message: "Please provide the required values: 'Name', 'Price'"
    };

    // if (typeof price != "number") return {
    //     success: false,
    //     message: "Price should be a number!"
    // };

    return {
        success: true,
        message: "Required values are provided!",
        data: {
            ...cartObject,
            quantity: 1
        }
    };
};

const createCartDetails = async (cartJson, rejectedJson, pool) => {
    try {

        let index = 0;
        let insertedArr = [];

        while (index < cartJson.length) {

            let id = Math.floor(Math.random() * 9000000000) + 1000000000;
            let date = new Date();

            let cartQuery = await pool.execute(
                "INSERT INTO`Carts`(id,name,price,quantity,userId,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?)",
                [id, cartJson[index].name, parseInt(cartJson[index].price), cartJson[index].quantity, cartJson[index].userId, date, date]
            );

            // console.log("Query response:", cartQuery)
            // console.log("Affected rows:", cartQuery[0].affectedRows)

            if (cartQuery[0].affectedRows) {
                console.log("Came here!")
                insertedArr = [...insertedArr, cartJson[index]];
                console.log("inserted arr:", insertedArr)
            };

            index++;
        }

        // console.log("Final response:", insertedArr, "arr length:", insertedArr.length);

        if (insertedArr.length < 1) {

            console.log("Error:", insertedArr.length)
            return {
                success: false,
                message: "Could not add to cart!"
            };
        }

        return {
            success: true,
            message: "Added to the cart!",
            data: {
                acceptedCartItems: insertedArr,
                rejectedCartItems: rejectedJson
            }
        };
    }
    catch (error) {
        return {
            success: false,
            message: error
        }
    }
}
