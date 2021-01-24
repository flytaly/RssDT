/* eslint-disable jsx-a11y/label-has-associated-control */
import { Formik } from 'formik';
import React, { useState } from 'react';
import Modal from 'react-modal';
import { animated, useSpring } from 'react-spring';
import * as Yup from 'yup';
import {
  MyFeedsDocument,
  MyFeedsQuery,
  useAddFeedToCurrentUserMutation,
} from '../generated/graphql';
import { DigestDisable, DigestSchedule, periodNames } from '../types';
import { isServer } from '../utils/is-server';
import InputUnderline from './forms/input-underline';

interface AddFeedModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const customStyles: Modal.Styles = {
  // overlay: {},
  content: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: 'none',
    border: 'none',
    // boxShadow: '0px 20px 30px 0px rgba(0, 0, 0, 0.7)',
    padding: 0,
    overflow: 'visible',
  },
};

const validationSchema = Yup.object().shape({
  url: Yup.string().url('Invalid feed address').required('The field is required'),
});

const AddFeedModal: React.FC<AddFeedModalProps> = ({ isOpen, closeModal }) => {
  const [addFeed] = useAddFeedToCurrentUserMutation();
  const [errorMsg, setErrorMsg] = useState('');
  const closingDuration = 100;
  const springProps = useSpring({
    transform: isOpen ? 'scale3d(1,1,1)' : 'scale3d(0,0,0)',
    config: { tension: 300, friction: 22, duration: isOpen ? undefined : closingDuration },
  });
  return (
    <Modal
      appElement={isServer() ? undefined : document.querySelector('main') || document.body}
      isOpen={isOpen}
      closeTimeoutMS={closingDuration + 10}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Add feed form"
    >
      <animated.div
        style={springProps}
        className="bg-gray-100 p-6 border border-gray rounded-md w-80 max-w-full shadow-modal"
      >
        <h2 className="text-lg font-bold text-center pb-2">Add new feed</h2>
        <Formik
          validationSchema={validationSchema}
          initialValues={{ url: 'https://', digest: DigestDisable }}
          onSubmit={async ({ url, digest }) => {
            try {
              const { data } = await addFeed({
                variables: { input: { feedUrl: url }, feedOpts: { schedule: digest } },
                update: (cache, result) => {
                  const uf = result.data?.addFeedToCurrentUser.userFeed;
                  if (uf) {
                    const prevQ = cache.readQuery<MyFeedsQuery>({ query: MyFeedsDocument });
                    const prevFeeds = prevQ?.myFeeds || [];
                    cache.writeQuery<MyFeedsQuery>({
                      query: MyFeedsDocument,
                      data: { __typename: 'Query', myFeeds: [...prevFeeds, uf] } as MyFeedsQuery,
                    });
                  }
                },
              });
              if (data?.addFeedToCurrentUser.userFeed) {
                closeModal();
              }
              if (data?.addFeedToCurrentUser.errors) {
                setErrorMsg(data?.addFeedToCurrentUser.errors[0].message);
              }
            } catch (error) {
              setErrorMsg(error.message);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <form className="flex flex-col" method="post" onSubmit={handleSubmit}>
              <InputUnderline
                id="url"
                type="text"
                placeholder="feed url"
                value={values.url}
                onChange={handleChange}
                onBlur={handleBlur}
                title="The RSS or Atom feed url"
                disabled={isSubmitting}
                required
              />
              <div className="text-error mb-4 text-sm">
                {touched.url && errors.url ? errors.url : ''}
              </div>
              <label htmlFor="digest" className="">
                Email digest:
              </label>
              <select
                className="select border-b-2 border-gray-500 mb-3 focus:border-primary"
                id="digest"
                defaultValue={DigestDisable}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
              >
                {Object.values(DigestSchedule).map((sc) => (
                  <option key={sc} value={sc}>{`${periodNames[sc]} digest`}</option>
                ))}
                <option key="disable" value="disable">
                  disabled
                </option>
              </select>
              {errorMsg ? (
                <div className="mb-3 p-1 text-sm text-error border-2 border-error">{errorMsg}</div>
              ) : null}
              <button
                type="submit"
                className="btn bg-secondary w-32 self-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </button>
            </form>
          )}
        </Formik>
      </animated.div>
    </Modal>
  );
};

export default AddFeedModal;
