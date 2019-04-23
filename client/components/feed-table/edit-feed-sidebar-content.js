import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Formik } from 'formik';
import Link from 'next/link';
import periods from '../../types/digest-periods';
import { GreenButtonLink, NoStylesButton, SubmitButton } from '../styled/buttons';
import arrowLeftImg from '../../static/arrow-left.svg';

const Container = styled.form.attrs({ method: 'POST' })`
    display: flex;
    flex-direction: column;
`;
const ImgContainerButton = styled(NoStylesButton)`
    width: 2rem;
    height: 2rem;
`;
const FeedLogoImg = styled.img`
    max-width: 50%;
    max-height: 4rem;
`;
const Row = styled.div`
    display: flex;
    margin: 0.5rem 0;
    align-items: center;
    & > * {
        margin-right: 1rem;
    }
`;
const FieldData = styled.div`
    flex-grow: 1;
    background-color: white;
    border: 1px solid ${props => props.theme.borderColor};
    padding: 0.5rem;
    font-size: 1.3rem;
    min-height: 3rem;
    word-break: break-all;
`;

const SpaceBetweenRow = styled(Row)`
    justify-content: space-between;
`;
const FieldTitle = styled.div`
    font-size: 1.4rem;
    font-weight: bold;
`;
const FeedLink = styled.a`
    color: inherit;
`;

const SubmitSideBarButton = styled(SubmitButton)`
    font-size: 1.5rem;
    padding: 0.4rem 2rem;
    max-width: 20rem;
`;

const EditFeed = ({ feedInfo, closeSidebar }) => {
    const { id, createdAt, lastUpdate, schedule } = feedInfo;
    const { title, link, url, imageTitle = '', imageUrl } = feedInfo.feed || {};

    return (
        <Formik
            initialValues={{ period: periods.DAILY }}
            onSubmit={() => {}}
        >
            {({
                /* values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit, */
                isSubmitting,
            }) => (
                <Container>
                    <SpaceBetweenRow>
                        <ImgContainerButton onClick={() => closeSidebar()}>
                            <img src={arrowLeftImg} alt="Go back" />
                        </ImgContainerButton>
                        {imageUrl && <FeedLogoImg src={imageUrl} title={imageTitle} />}
                    </SpaceBetweenRow>
                    <SpaceBetweenRow>
                        <Link href={`/feeds/view?id=${id}`}><GreenButtonLink>View Items</GreenButtonLink></Link>
                    </SpaceBetweenRow>
                    <Row>
                        <FieldTitle>Title:</FieldTitle>
                        <FieldData>{title}</FieldData>
                    </Row>
                    <Row>
                        <FieldTitle>Schedule</FieldTitle>
                        <FieldData>{schedule}</FieldData>
                    </Row>
                    <Row>
                        <FieldTitle>Site Link:</FieldTitle>
                        <FieldData>
                            <FeedLink href={link} target="_blank">
                                {link}
                            </FeedLink>
                        </FieldData>
                    </Row>
                    <Row>
                        <FieldTitle>Feed URL</FieldTitle>
                        <FieldData>
                            <FeedLink href={url} target="_blank">
                                {url}
                            </FeedLink>
                        </FieldData>
                    </Row>
                    <Row>
                        <FieldTitle>Date Added</FieldTitle>
                        <FieldData>{new Date(createdAt).toLocaleString()}</FieldData>
                    </Row>
                    <Row>
                        <FieldTitle>Date of the last digest</FieldTitle>
                        <FieldData>{new Date(lastUpdate).toLocaleString()}</FieldData>
                    </Row>
                    <Row>
                        <SubmitSideBarButton type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'UPDATE'}
                        </SubmitSideBarButton>
                    </Row>
                </Container>
            )}
        </Formik>
    );
};

EditFeed.propTypes = {
    feedInfo: PropTypes.shape({
        feed: PropTypes.shape({}),
        id: PropTypes.string,
        lastUpdate: PropTypes.string,
        createdAt: PropTypes.string,
        schedule: PropTypes.string,
    }).isRequired,
    closeSidebar: PropTypes.func.isRequired,
};

export default EditFeed;
