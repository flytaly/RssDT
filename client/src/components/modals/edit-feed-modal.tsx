/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import Modal from 'react-modal';
import { animated, useSpring } from 'react-spring';
import {
  TernaryState,
  Theme,
  useMeQuery,
  useMyOptionsQuery,
  UserFeed,
} from '../../generated/graphql';
import { isServer } from '../../utils/is-server';
import ArrowLeftIcon from '../../../public/static/arrow-left.svg';
import InputUnderline from '../forms/input-underline';
import { DigestSchedule, periodNames } from '../../types';
import SelectUnderline from '../forms/select-underline';

interface EditFeedModalProps {
  isOpen: boolean;
  closeModal: () => void;
  feed: UserFeed | null;
}

const customStyles: Modal.Styles = {
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '0.375rem',
  },
  content: {
    position: 'absolute',
    top: '0',
    left: 'auto',
    right: '0',
    bottom: '0',
    height: '100%',
    width: '24rem',
    background: 'none',
    border: 'none',
    padding: 0,
    overflow: 'visible',
  },
};

const LabeledSelect: React.FC<{ title: string }> = ({ title, children }) => (
  <label className="flex mb-3">
    <b className="font-medium" style={{ minWidth: '40%' }}>
      {title}
    </b>
    <span className="ml-2 flex-1">
      <SelectUnderline>{children}</SelectUnderline>
    </span>
  </label>
);

const InfoRow: React.FC<{ title: string }> = ({ title, children }) => (
  <div className="flex items-center mb-3">
    <b className="font-medium">{title}</b>
    <div className="flex-1 ml-3 p-1 border-b-2 border-gray-500 overflow-x-scroll">{children}</div>
  </div>
);

const EditFeedModal: React.FC<EditFeedModalProps> = ({ isOpen, closeModal, feed }) => {
  const { data } = useMyOptionsQuery();
  const { withContentTableDefault, attachmentsDefault, itemBodyDefault } = data?.myOptions || {};
  const closingDuration = 100;
  const springProps = useSpring({
    transformOrigin: 'right center',
    transform: isOpen ? 'scale3d(1,1,1)' : 'scale3d(0,1,0)',
    config: { tension: 340, friction: 30, duration: isOpen ? undefined : closingDuration },
  });

  const formatDefault = (defaultValue?: boolean | null) => {
    return defaultValue === undefined || defaultValue === null
      ? 'Default'
      : `DEFAULT (${defaultValue ? 'Enable' : 'Disable'})`;
  };

  return (
    <Modal
      appElement={isServer() ? undefined : document.querySelector('#card-root') || document.body}
      parentSelector={() => document.querySelector('#card-root') as HTMLElement}
      isOpen={isOpen}
      closeTimeoutMS={closingDuration + 10}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Edit feed"
    >
      <animated.div
        style={springProps}
        className="flex flex-col bg-gray-200 p-4 border-l border-gray rounded-md max-w-full shadow-modal-right h-full text-sm overflow-y-scroll"
      >
        {!feed ? null : (
          <>
            <div className="flex items-start justify-between h-9">
              <button type="button" className="icon-btn">
                <ArrowLeftIcon className="w-4" />
              </button>
              {feed.feed.imageUrl ? (
                <img src={feed.feed.imageUrl} alt="feed icon" className="w-auto h-full" />
              ) : null}
            </div>
            <h3 className="font-bold mb-3 text-base">{feed.feed.title}</h3>
            <h4 className="font-semibold mb-3 text-base">Settings</h4>
            <LabeledSelect title="Email Digest">
              {Object.values(DigestSchedule).map((sc) => (
                <option key={sc} value={sc}>{`${periodNames[sc]} digest`}</option>
              ))}
              <option key="disable" value="disable">
                disabled
              </option>
            </LabeledSelect>

            <LabeledSelect title="Theme">
              <option value={Theme.Default}>Default</option>
              <option value={Theme.Text}>Text</option>
            </LabeledSelect>

            <LabeledSelect title="Table of Content">
              <option value={TernaryState.Default}>{formatDefault(withContentTableDefault)}</option>
              <option value={TernaryState.Disable}>Disable</option>
              <option value={TernaryState.Enable}>Enable</option>
            </LabeledSelect>

            <LabeledSelect title="Attachments">
              <option value={TernaryState.Default}>{formatDefault(attachmentsDefault)}</option>
              <option value={TernaryState.Disable}>Disable</option>
              <option value={TernaryState.Enable}>Enable</option>
            </LabeledSelect>

            <LabeledSelect title="Feed items content">
              <option value={TernaryState.Default}>{formatDefault(itemBodyDefault)}</option>
              <option value={TernaryState.Disable}>Disable</option>
              <option value={TernaryState.Enable}>Enable</option>
            </LabeledSelect>

            <button type="submit" className="btn bg-primary w-36">
              Update
            </button>
            <h4 className="font-semibold my-3 text-base">Feed Info</h4>

            <InfoRow title="Site Link">
              <a className="underline" href={feed.feed.link || feed.feed.url}>
                {feed.feed.link || feed.feed.url}
              </a>
            </InfoRow>
            <InfoRow title="Feed URL">
              <a className="underline" href={feed.feed.url}>
                {feed.feed.url}
              </a>
            </InfoRow>
            <InfoRow title="Date Added">{new Date(feed.createdAt).toLocaleString()}</InfoRow>
            <InfoRow title="Date of the last digest">
              {new Date(feed.lastDigestSentAt).toLocaleString()}
            </InfoRow>
          </>
        )}
      </animated.div>
    </Modal>
  );
};

export default EditFeedModal;
