import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, Container } from 'react-bootstrap';
import { useCheckoutMutation } from '../../slices/orderApiSlice.jsx';
import { useGetUsersQuery } from '../../slices/userApiSlice.jsx';
import { useGetCartQuery, useDeleteCartProductMutation } from '../../slices/cartApiSlice.jsx';
import { selectAddressById } from '../../slices/addressApiSlice.jsx';
import { useGetGiftBasketQuery } from '../../slices/giftBasketApiSlice.jsx';
import { useGetBasketQuery } from "../../slices/basketApiSlice.jsx";
import { useGetProductQuery } from "../../slices/productApiSlice.jsx";
import { useGetDecorationQuery } from "../../slices/decorationApiSlice.jsx";
import { useGetCardQuery } from "../../slices/cardApiSlice.jsx";
import useAuth from '../../hooks/useAuth.jsx';

import { Button } from 'react-bootstrap';

function Checkout() {
    const location = useLocation();
    const addressID = location.state.selectAddress
    const productIds = location.state.basketId
    const user = location.state.user[0]
    const totalPrice = location.state.totalPrice
    const navigate = useNavigate()
    //console.log(totalPrice)
    const { email, isAdmin } = useAuth()

    const [checkout] = useCheckoutMutation()
    const [deleteBasket] = useDeleteCartProductMutation()

    const address = useSelector((state) => selectAddressById(state, addressID))

    const LoadUser = () => {
        const {
            data: users,
            isLoading,
            isSuccess,
            isError,
            error
        } = useGetUsersQuery('usersList', {
            pollingInterval: 15000,
            refetchOnFocus: true,
            refetchOnMountOrArgChange: true
        })

        if (isSuccess) {
            const { ids, entities } = users

            const filteredIds = ids?.filter(userId => entities[userId].email === email)

            return filteredIds
        }
    }

    const userId = LoadUser()

    const LoadCart = () => {
        const {
            data: cart,
            isLoading,
            isSuccess,
            isError,
            error
        } = useGetCartQuery('cartList', {
            pollingInterval: 15000,
            refetchOnFocus: true,
            refetchOnMountOrArgChange: true
        })

        if (isSuccess) {
            const { ids, entities } = cart

            const filteredIds = ids?.filter(cartId => entities[cartId].user === userId[0])

            return filteredIds
        }
    }

    const cartId = LoadCart()
    //console.log(cartId)

    const {
        data: giftbasket,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetGiftBasketQuery('giftbasketList', {
        pollingInterval: 15000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    });

    const {
        data: basketData,
        isLoading: basketIsLoading,
        isSuccess: basketIsSuccess,
        isError: basketIsError,
        error: basketError
    } = useGetBasketQuery('basketList', {
        pollingInterval: 15000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    });

    const {
        data: decorationData,
        isLoading: decorationIsLoading,
        isSuccess: decorationIsSuccess,
        isError: decorationIsError,
        error: decorationError
    } = useGetDecorationQuery('decorationList', {
        pollingInterval: 15000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    });

    const {
        data: productData,
        isLoading: productIsLoading,
        isSuccess: productIsSuccess,
        isError: productIsError,
        error: productError
    } = useGetProductQuery('productList', {
        pollingInterval: 15000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    });

    const {
        data: cardData,
        isLoading: cardIsLoading,
        isSuccess: cardIsSuccess,
        isError: cardIsError,
        error: cardError
    } = useGetCardQuery('cardList', {
        pollingInterval: 15000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    });

    let filteredGiftBasketItems

    if(isSuccess){
        const { ids, entities } = giftbasket;

        filteredGiftBasketItems = ids?.filter(giftBasketId => productIds
            .includes(entities[giftBasketId].id))
            .map(giftBasketId => entities[giftBasketId]);
    }
    console.log(filteredGiftBasketItems)

    const placeorder = async () => {
        const result = await checkout({ user, productIds, totalPrice, address: addressID })
        console.log(result)

        for (const giftBasketId of productIds) {
            await deleteBasket({ id: cartId, giftBasketId })
        }

        //console.log(result)
        window.location.href = result.data.url
    }
    

    return (
        <>
            <h1>Check Out</h1>
            <div>
                <Container>
                    <Card className="m-5" >
                        <Card.Title>Address</Card.Title>
                        <Card.Text className="m-2">
                            Name : {address.firstname} {address.lastname}
                        </Card.Text>

                        <Card.Text className="m-2">
                            Address : {address.address} {address.city} {address.state} {address.country}
                        </Card.Text>

                        <Card.Text className="m-2">
                            Phone Number : {address.phone}
                        </Card.Text>
                    </Card>
                </Container>

                <Container>
                    <Card className="m-5">
                        <Card.Title>Gift Baskets</Card.Title>
                        {filteredGiftBasketItems.map((giftBasket, index) => (
                            <div key={index} className='mt-5'>
                                <Card.Text>Gift Basket {index + 1} </Card.Text>

                                <Card.Text>Basket : {basketData?.entities[giftBasket.basket]?.name}</Card.Text>

                                <Card.Text>Decorations : {giftBasket.decoration.map(decorationId => 
                                        decorationData?.entities[decorationId]?.name).join(', ')}</Card.Text>

                                <Card.Text>Products : {giftBasket.product.map(productId => 
                                        productData?.entities[productId]?.name).join(', ')}</Card.Text>

                                <Card.Text>Card : {cardData?.entities[giftBasket.card]?.name}</Card.Text>

                                <Card.Text>Card Text : {giftBasket.cardText}</Card.Text>

                                <Card.Text>Price : {giftBasket.totalPrice}</Card.Text>
                            </div>
                        ))}
                    </Card>
                </Container>

                <p>Total Price : {totalPrice.toFixed(2)}</p>
            </div>

            <Button onClick={placeorder}>Pay Now</Button>
        </>
    );
}

export default Checkout