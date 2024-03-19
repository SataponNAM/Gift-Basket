import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useGetDecorationQuery } from "../../../../../slices/decorationApiSlice";
import ManageBow from "../../../../../components/Decoration/Manage/ManageBow";

function BowList() {
    const {
        data: bow,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetDecorationQuery('bowList', {
        pollingInterval: 15000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    });

    let content;
    const navigate = useNavigate();

    if (isLoading) content = <p>Loading...</p>;

    if (isError) {
        content = <p className='errmsg'>{error?.data?.message}</p>;
    }

    if (isSuccess) {
        const { ids, entities } = bow;

        // Filter out decorations that are not bows
        const bowIds = ids.filter(decoId => entities[decoId]?.category === "Bow");

        const groupedIds = [];
        while (bowIds.length > 0) {
            groupedIds.push(bowIds.splice(0, 4));
        }

        // Render rows and columns 
        content = groupedIds.map((rowIds, index) => (
            <Row key={index} className="mb-3">
                {rowIds.map((decoId) => (
                    <Col key={decoId} xs={12} sm={6} md={3}>
                        <ManageBow decoId={decoId} />
                    </Col>
                ))}
            </Row>
        ));
    }

    const addBowClick = () => {
        navigate('/adminDash/admin/product/bow/add')
    }

    return (
        <Container>
            <h1>Bow</h1>

            <div>
                <Button onClick={addBowClick}>เพิ่มสินค้า</Button>
            </div>

            {content}
        </Container>
    );
}

export default BowList;