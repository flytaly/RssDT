import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Input from './input';
import RssSquareIcon from '../../../public/static/rss-square.svg';
import MailIcon from '../../../public/static/envelope.svg';
import ClockIcon from '../../../public/static/clock.svg';
import Select from './select';
import { periodNames as names, DigestSchedule } from '../../types';
import { useAddFeedWithEmailMutation } from '../../generated/graphql';
import { MessageItem } from '../welcome-card/animated-message';
import GraphQLError from '../graphql-error';

// VALIDATION
const AddFeedSchema = Yup.object().shape({
  url: Yup.string().url('Invalid feed address').required('The field is required'),
  email: Yup.string().email('Invalid email address').required('The field is required'),
});

const getUserInfo = () => {
  if (Intl && Intl.DateTimeFormat) {
    const { timeZone, locale } = Intl.DateTimeFormat().resolvedOptions();
    return { timeZone, locale };
  }
  return null;
};

interface AddFeedFormProps {
  email?: string;
  setMessages?: React.Dispatch<React.SetStateAction<MessageItem[]>>;
}

function makeSuccessMessage(email: string, title: string, schedule: DigestSchedule) {
  const content = (
    <span>
      <div>
        <b>{title}</b>
        <span> [</span>
        <b>{`${names[(schedule as unknown) as DigestSchedule]} digest`}</b>
        <span>] </span>
      </div>
      <div>{`Activation link has been sent to ${email}.`}</div>
    </span>
  );
  return { key: `success${Math.random() * 1000}`, content, type: 'success' } as MessageItem;
}

const AddFeedForm: React.FC<AddFeedFormProps> = ({ email = '', setMessages }) => {
  const [addFeed] = useAddFeedWithEmailMutation();
  console.log(email);

  return (
    <Formik
      initialValues={{ email, url: 'https://', digest: DigestSchedule.daily }}
      enableReinitialize
      validationSchema={AddFeedSchema}
      onSubmit={async (formVariables, { setSubmitting, resetForm }) => {
        try {
          const { data } = await addFeed({
            variables: {
              input: { email: formVariables.email, feedUrl: formVariables.url },
              userInfo: getUserInfo(),
              feedOpts: { schedule: formVariables.digest },
            },
          });
          if (data?.addFeedWithEmail?.userFeed) {
            const { userFeed } = data?.addFeedWithEmail;
            setMessages?.([
              makeSuccessMessage(
                formVariables.email,
                userFeed.feed.title || '',
                (userFeed.schedule as unknown) as DigestSchedule,
              ),
            ]);
            resetForm();
          } else {
            const errMessages: MessageItem[] | undefined = data?.addFeedWithEmail?.errors?.map(
              (e, idx) => ({
                key: `error_${idx + Math.random()}`,
                text: e.message,
                type: 'error',
              }),
            );
            setMessages?.(errMessages || []);
          }
        } catch (err) {
          setMessages?.([{ key: 'error', content: <GraphQLError error={err.message} /> }]);
        }
        setSubmitting(false);
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <form className="flex flex-col w-full" onSubmit={handleSubmit}>
          <Input
            id="url"
            type="url"
            IconSVG={RssSquareIcon}
            placeholder="https://..."
            value={values.url}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.url}
            error={errors.url}
            title="The RSS or Atom feed url"
            disabled={isSubmitting}
            required
          />
          <Input
            id="email"
            type="email"
            IconSVG={MailIcon}
            placeholder="Email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            touched={touched.email}
            error={errors.email}
            disabled={!!email || isSubmitting}
            title="Email address"
            required
          />
          <Select
            id="digest"
            IconSVG={ClockIcon}
            defaultValue={DigestSchedule.daily}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.digest}
            disabled={isSubmitting}
          >
            {Object.values(DigestSchedule).map((sc) => (
              <option key={sc} value={sc}>{`${names[sc]} digest`}</option>
            ))}
          </Select>
          <button
            type="submit"
            className="btn w-full text-xl tracking-wider"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'loading...' : 'subscribe'}
          </button>
        </form>
      )}
    </Formik>
  );
};

export default AddFeedForm;
