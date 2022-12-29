const sql = require('mysql2');
const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');

exports.handler = async (event) => {
    let user_id;
    try {
        user_id = event.pathParameters.userid;

        console.log('User Id:', user_id);


        // create the connection to database
        const connection = await mysql.createConnection({
            host: '18.225.10.147',
            user: 'tacobell',
            password: 'password',
            database: 'tacobell'
        });

        console.log('db client response:', connection);

        let getcart = await getCartDetails(user_id, connection);

        console.log('Callback function response:', getcart);

        if (!getcart.success) return {
            statusCode: 404,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(getcart)
        };

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(getcart.data)
        };
    }
    catch (error) {

        const response = {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(error),
        };
        return response;
    }
};

const getCartDetails = async (userId, pool) => {
    try {
        let cartQuery = await pool.execute('SELECT * FROM `Carts` WHERE `userId` = ?', [userId]);

        console.log('Query response:', cartQuery[0]);

        if (!cartQuery) return {
            success: false,
            message: 'Cart items for user does not exist!'
        }

        const cartArr = cartQuery[0];
        let totalPrice = 0;

        cartArr.forEach(ele => {
            totalPrice += ele.price
        });

        console.log("Total price cal:", totalPrice);

        return {
            success: true,
            message: 'Cart item found!',
            data: {
                items: cartArr,
                totalPrice: totalPrice
            }
        }
    }
    catch (error) {
        return {
            success: false,
            message: error
        }
    }
}
