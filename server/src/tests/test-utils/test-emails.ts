import axios from 'axios';

const url = 'http://127.0.0.1:3434';

type MailDevEmail = {
    id: string;
    time: string;
    from: { address: string; name: string }[];
    to: { address: string; name: string }[];
    subject: string;
    text: string;
    html: string;
    headers: {
        'content-type': string;
        from: string;
        to: string;
        subject: string;
        'x-some-header': string;
        'x-mailer': string;
        date: string;
        'message-id': string;
        'mime-version': string;
    };
    read: boolean;
    messageId: string;
    priority: string;
    attachments: [
        {
            contentType: string;
            contentDisposition: string;
            fileName: string;
            generatedFileName: string;
            contentId: string;
            stream: Object;
            checksum: string;
        },
    ];
    envelope: {
        from: string;
        to: string[];
        host: string;
        remoteAddress: string;
    };
};

export const getEmails = async () => {
    const resp = await axios.get(`${url}/email`);
    return resp.data;
};

export const getEmailByAddress = async (address: string) => {
    const emails: MailDevEmail[] = await getEmails();
    return emails.find((e: any) => e.headers.to === address);
};

export const deleteEmails = () => axios.delete(`${url}/email/all`);
