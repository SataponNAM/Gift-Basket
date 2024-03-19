import { Container } from "react-bootstrap";
import useAuth from '../../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'
import { useGetOrderQuery } from "../../slices/orderApiSlice.jsx";
import { useGetUsersQuery } from '../../slices/userApiSlice.jsx'
import Order from "../../components/Order/Order.jsx";

function OrderList () {
    const { email, isAdmin } = useAuth()

    const {
        data: order,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetOrderQuery('orderList', {
        pollingInterval: 15000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

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

    let content

    if(isLoading) content = <p>Loading...</p>

    if(isError) {
        content = <p className='errmsg'>{error?.data?.message}</p>
    }

    if(isSuccess){
        const { ids, entities } = order

        let filteredIds
        if (isAdmin) {
            filteredIds = [...ids]
        } else {
            filteredIds = ids?.filter(orderId => entities[orderId].user === userId[0])
        }
  
        content = ids?.length && filteredIds.map(orderId => <Order key={orderId} orderId={orderId} />)
    }

    return (
        <Container>
            <h1>Order</h1>
            <div>
                {content}
            </div>
        </Container>
    )
}

export default OrderList