import { Button, Container, Form } from 'react-bootstrap'
import { useState } from 'react'
import { useNavigate  } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.jsx'
import { useGetCartQuery } from '../../slices/cartApiSlice.jsx'
import { useGetUsersQuery } from '../../slices/userApiSlice.jsx'
import Cart from '../../components/Cart/Cart.jsx'

function CartList() {
    let content
    const { email, isAdmin } = useAuth()
    const navigate = useNavigate()
    const [total, setTotal] = useState(0)

    const makePayment = async () => {
        // go to choose address
        navigate('/dash/order/selectaddress', {state: {basketId, totalPrice: total}})
    }

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

    if (isLoading) content = <p>Loading...</p>

    if (isError) {
        content = <p className='errmsg'>{error?.data?.message}</p>
    }

    let basketId
    let buttonPayment

    if (isSuccess) {
        const { ids, entities } = cart

        const filteredIds = ids?.filter(cartId => entities[cartId].user === userId[0])
        const filterData = ids?.filter(cartId => entities[cartId].user === userId[0]).map(cartId => entities[cartId])

        if (filterData.length > 0) {
            basketId = filterData[0].giftBasket;
            buttonPayment = (<Button onClick={makePayment}>ซื้อสินค้า</Button>)
            //console.log(basketId);
        }else {
            buttonPayment = (<Button onClick={makePayment} disabled>ซื้อสินค้า</Button>)
        }

        //console.log(filterData)

        content = ids?.length && filteredIds.map(cartId => <Cart key={cartId} cartId={cartId} total={total} setTotal={setTotal} />)
    }

    return (
        <>
            <Container>
                <h1>Cart</h1>
                <Container>
                    <Form>
                        {content}
                    </Form>
                </Container>

                <Container>
                    <p>ราคารวม : {total} บาท</p>
                    {buttonPayment}
                </Container>

            </Container>
        </>
    )
}

export default CartList