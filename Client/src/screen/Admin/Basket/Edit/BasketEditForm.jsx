import { useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { selectBasketById, useUpdateBasketMutation } from "../../../../slices/basketApiSlice"
import { Button, Container, Form, Image } from "react-bootstrap";
import { useState } from "react";
import Base64Convert from "../../../../hooks/Base64Convert";

function BasketEdit() {
    const navigate = useNavigate()
    const { id } = useParams()
    const basket = useSelector((state) => selectBasketById(state, id));
    //console.log(basket)

    const [name, setName] = useState(basket ? basket.name : "")
    const [price, setPrice] = useState(basket ? basket.price : "")
    const [image, setImage] = useState(basket ? basket.image : "")

    const [sendUpdate] = useUpdateBasketMutation()

    const imageUploaded = async (e) => {
        const file = e.target.files[0];
        const im = await Base64Convert(file)
        setImage('data:image/webp;base64,' + im)
        console.log(image)
    }

    const onSave = async (e) => {
        e.preventDefault()
        const result = await sendUpdate({ id, name, price, image })
        //console.log(result)

        navigate('/adminDash/admin/product/basket/basketList')
    }

    return (
        <Container>
            <h1>edit</h1>

            <Form className="mt-5" onSubmit={onSave}>
                <Form.Group>
                    <Form.Label>ชื่อสินค้า</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mt-3">
                    <Form.Label>ราคา</Form.Label>
                    <Form.Control
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mt-3">
                    <Form.Label>รูปภาพ</Form.Label>
                    <Form.Control
                        type="file"
                        accept='.jpeg, .png, .jpg'
                        onChange={imageUploaded}
                    />
                </Form.Group>

                <Button type="submit">Save</Button>

            </Form>

            <Image src={image}></Image>
        </Container>
    )
}

export default BasketEdit