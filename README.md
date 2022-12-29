# TACO BELL ASSIGNMENT BACKEND CODE

## API END POINTS:

    - View cart: https://v142vfs394.execute-api.us-east-2.amazonaws.com/dev/{userid}
        - HTTP method: GET
        - Request payload: N/A
        - Response payload if successful: {
            statusCode: 200,
            success: true,
            message: 'Cart item found!',
            data: {
                items: [Array of cart objects],
                totalPrice: float value<total price of all cart objects>
            }
        }
        - Response if cart objects not present: {
            statusCode: 404,
            success: false,
            message: 'Cart items for user does not exist!'
        }

        - Response if error occurred: {
            statusCode: 400,
            success: false,
            message: <error>
        }

    - Add cart: https://v142vfs394.execute-api.us-east-2.amazonaws.com/dev/{userid}
        - HTTP method: POST
        - Request payload: [
            {
                "name": <name of item: string>,
                "price": <price of item: float or int>
            },
            {
                "name": <name of item: string>,
                "price": <price of item: float or int>
            },
        ] 
        - Response payload if successful: {
            statusCode: 201,
            success: true,
            message: "Added to the cart!",
            data: {
                acceptedCartItems: [Array of added cart objects in db],
                rejectedCartItems: [Array of cart objects that failed validation]
            } 
        }
        - Response payload if objects couldn't b added: {
            statusCode: 404,
            success: false,
            message: "Could not add to cart!"
        }
        - Response payload if objects failed validation: {
            statusCode: 404,
            success: false,
            message: "Please provide the required values: 'Name', 'Price'"
        }
        - Response payload if error occurred: {
            statusCode: 400,
            success: false,
            message: <error>
        }