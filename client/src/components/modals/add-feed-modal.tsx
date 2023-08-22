'use client';

import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { animated, useSpring } from 'react-spring';
import * as Yup from 'yup';

import { useAddFeedToCurrentUserMutation } from '@/app/lib/mutations/add-feed-user';
import InputUnderline from '@/components/forms/input-underline';
import SelectUnderline from '@/components/forms/select-underline';
import { DigestDisable, DigestSchedule, periodNames } from '@/types';
import { getAppElement } from '@/utils/get-app-element';

interface AddFeedModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const customStyles: Modal.Styles = {
  overlay: {
    position: 'fixed',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '0.375rem',
  },
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
    maxWidth: '100%',
  },
};

const validationSchema = Yup.object().shape({
  url: Yup.string().url('Invalid feed address').required('The field is required'),
});

const AddFeedModal = ({ isOpen, closeModal }: AddFeedModalProps) => {
  const addFeedMutation = useAddFeedToCurrentUserMutation();

  const [errorMsg, setErrorMsg] = useState('');
  const closingDuration = 100;
  const springProps = useSpring({
    transform: isOpen ? 'scale3d(1,1,1)' : 'scale3d(0,0,0)',
    config: { tension: 400, friction: 30, duration: isOpen ? undefined : closingDuration },
  });

  useEffect(() => {
    if (isOpen) setErrorMsg('');
  }, [isOpen]);

  return (
    <Modal
      appElement={getAppElement()}
      parentSelector={() => document.querySelector('#card-root') as HTMLElement}
      isOpen={isOpen}
      closeTimeoutMS={closingDuration + 10}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Add feed form"
    >
      <animated.div
        style={springProps}
        className="bg-gray-100 p-6 border border-gray rounded-md w-80 max-w-full shadow-modal max-h-screen overflow-auto"
      >
        <h2 className="text-lg font-bold text-center pb-2">Add new feed</h2>
        <Formik
          validationSchema={validationSchema}
          initialValues={{ url: 'https://', digest: DigestDisable }}
          onSubmit={async ({ url, digest }) => {
            try {
              const data = await addFeedMutation.mutateAsync({
                feedUrl: url,
                feedOpts: { schedule: digest },
              });
              if (data?.addFeedToCurrentUser.errors) {
                setErrorMsg(data?.addFeedToCurrentUser.errors[0].message);
                return;
              }
              closeModal();
            } catch (error) {
              setErrorMsg((error as Error).message);
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
              <div className="text-error mt-2 mb-6 text-sm">
                {touched.url && errors.url ? errors.url : ''}
              </div>
              <label htmlFor="digest" className="mb-1">
                Email digest:
              </label>
              <SelectUnderline
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
              </SelectUnderline>
              {errorMsg ? (
                <div className="my-3 p-1 text-sm text-error border-2 border-error">{errorMsg}</div>
              ) : null}
              <button
                type="submit"
                className="btn bg-secondary w-32 self-center mt-3"
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
