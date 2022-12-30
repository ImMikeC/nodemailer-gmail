const nodemailer = require('nodemailer');

// Set up the Gmail transport
const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: 'your-email@gmail.com',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    refreshToken: 'your-refresh-token'
  }
});

// Set up the parameters for the search query
const searchParams = {
  user: 'me',
  q: 'label:inbox is:unread', // only show unread emails in the inbox
};

// Perform the search
transport.search(searchParams, (err, results) => {
  if (err) {
    console.error(err);
    return;
  }

  // Get the messages
  const messages = results.messages;

  // Iterate over the messages and process them
  for (const message of messages) {
    transport.getMessage({id: message.id, user: 'me'}, (err, msg) => {
      if (err) {
        console.error(err);
        return;
      }

      // Get the sender of the email
      const sender = msg.from[0];
      console.log(`Sender: ${sender.name} <${sender.address}>`);

      // Get the attachments
      const attachments = msg.attachments;
      if (attachments) {
        console.log(`Number of attachments: ${attachments.length}`);

        // Iterate over the attachments and download them
        for (const attachment of attachments) {
          console.log(`Downloading attachment: ${attachment.filename}`);
          attachment.download().then(content => {
            // Save the attachment to a file
            fs.writeFileSync(attachment.filename, content);
          }).catch(err => {
            console.error(err);
          });
        }
      }

      // Add a label to the email based on some criteria (e.g. sender's email address)
      if (sender.address === 'important@example.com') {
        transport.modifyMessage({id: message.id, user: 'me', addLabelIds: ['Label_1']}, err => {
          if (err) {
            console.error(err);
          }
        });
      }
    });
  }
});
