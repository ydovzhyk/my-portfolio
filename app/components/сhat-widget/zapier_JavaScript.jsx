// Code for fist JavaScript step in Zapier
// const storeKey = 'history';
// const userId = inputData.userId;
// const newMessage = {
//   role: 'user',
//   content: inputData.message,
//   key: inputData.key,
// };

// const storageSecret = process.env.ZAPIER_STORAGE_SECRET;

// const fetchUrl = `https://store.zapier.com/api/records?secret=${storageSecret}&key=${storeKey}`;
// const updateUrl = `https://store.zapier.com/api/records?secret=${storageSecret}`;

// fetch(fetchUrl)
//   .then((res) => res.json())
//   .then((data) => {
//     const history = data[storeKey] || {};
//     const existing = history[userId] || [];

//     const alreadyExists = existing.some((msg) => msg.key === newMessage.key);
//     const messages = existing.map(({ role, content }) => ({ role, content }));

//     if (alreadyExists) {
//       callback(null, {
//         success: true,
//         skipped: true,
//         messages: JSON.stringify(messages),
//       });
//       return;
//     }

//     const updated = [...existing, newMessage];
//     const updatedPayload = {
//       [storeKey]: {
//         [userId]: updated,
//       },
//     };

//     return fetch(updateUrl, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(updatedPayload),
//     }).then((saveRes) => {
//       if (!saveRes.ok) throw new Error('Saving to storage failed');
//       const updatedMessages = updated.map(({ role, content }) => ({ role, content }));
//       callback(null, {
//         success: true,
//         saved: true,
//         messages: JSON.stringify(updatedMessages),
//       });
//     });
//   })
//   .catch((err) => {
//     callback(null, { error: err.message });
//   });

  // Code for second JavaScript step in Zapier
  // const storeKey = 'history'
  // const userId = inputData.userId
  // const assistantMessage = {
  //   role: 'assistant',
  //   content: inputData.message,
  //   key: inputData.key,
  // }

  // const storageSecret = process.env.ZAPIER_STORAGE_SECRET;
  // const fetchUrl = `https://store.zapier.com/api/records?secret=${storageSecret}&key=${storeKey}`
  // const updateUrl = `https://store.zapier.com/api/records?secret=${storageSecret}`

  // fetch(fetchUrl)
  //   .then((res) => res.json())
  //   .then((data) => {
  //     const history = data[storeKey] || {}
  //     const existing = history[userId] || []

  //     console.log('💬 Assistant reply:', assistantMessage)

  //     const alreadyExists = existing.some(
  //       (msg) => msg.key === assistantMessage.key && msg.role === 'assistant'
  //     )

  //     if (alreadyExists) {
  //       console.log(
  //         '⚠️ Assistant reply with same key already exists. Skipping...'
  //       )
  //       callback(null, { success: true, skipped: true })
  //       return
  //     }

  //     const updated = [...existing, assistantMessage]
  //     const updatedPayload = {
  //       [storeKey]: {
  //         [userId]: updated,
  //       },
  //     }

  //     console.log(
  //       '📤 Payload to store:',
  //       JSON.stringify(updatedPayload, null, 2)
  //     )

  //     return fetch(updateUrl, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(updatedPayload),
  //     })
  //   })
  //   .then((saveRes) => {
  //     if (!saveRes.ok) throw new Error('Saving to storage failed')
  //     callback(null, { success: true, saved: true })
  //   })
  //   .catch((err) => {
  //     console.error('🚨 Error:', err.message)
  //     callback(null, { error: err.message })
  //   })




