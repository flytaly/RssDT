import { useState } from 'react';

import XCircle from '@/assets/x-circle.svg';
import { DigestSchedule } from '@/gql/generated';
import { composeEmailSubject, defaultTemplate } from '@/utils/compose-subject';

import InputUnderline from './input-underline';

interface EditEmailSubjectProps {
  value?: string | null;
  loading?: boolean;
  onSave?: (value: string) => unknown;
}

const EditEmailSubject = ({ value, loading, onSave }: EditEmailSubjectProps) => {
  const [subject, setSubject] = useState(value || defaultTemplate);
  const example = {
    feedTitle: 'Feed Title',
    period: DigestSchedule.Daily,
    template: subject || defaultTemplate,
  };

  const commitValue = () => onSave?.(subject);

  return (
    <>
      <div className="flex items-end flex-wrap">
        <div className="flex-shrink-0 relative w-64">
          <InputUnderline
            className="w-full pr-7"
            placeholder={defaultTemplate}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onBlur={commitValue}
          />
          <div className="absolute top-1/2 right-0 pr-2">
            <button type="button" className="icon-btn" onClick={() => setSubject(defaultTemplate)}>
              <XCircle className="w-auto h-4 transform -translate-y-1/2" />
            </button>
          </div>
        </div>
        <button
          className="btn-hover bg-secondary text-white border border-b-2 border-gray px-2 "
          type="submit"
          disabled={loading}
          onClick={commitValue}
        >
          {loading ? 'Saving' : 'Save'}
        </button>
        <div className="ml-3 mt-2 min-w-min flex-shrink-0">
          <span>Example: </span>
          <span className="example bg-purple-100 font-medium">
            {composeEmailSubject(example.feedTitle, example.period, example.template)}
          </span>
        </div>
      </div>
      <div className="mt-2">
        <b className="font-medium">template words: </b>
        <ul>
          <li>
            <i>{'{{ title }} '}</i>
            <span>- title of the feed; </span>
          </li>
          <li>
            <i>{'{{ digest }} '}</i>
            <span>- digest type (Daily, Hourly, etc).</span>
          </li>
        </ul>
      </div>
    </>
  );
};

export default EditEmailSubject;
