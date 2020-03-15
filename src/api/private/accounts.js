import api from '../../utils/api';

async function getAccounts() {
  return api.get('/accounts');
}

async function deleteAccount(id) {
  return api.put('/accounts', {
    accountId: id
  });
}

async function updateAccountLabel(accountId, newLabel) {
  return api.put('/accounts/update', {
    accountId,
    newLabel
  });
}

async function postManualAccount(label) {
  return api.post('/accounts/', {
    type: 'MANUAL',
    label,
  });
}

export default getAccounts;
export { deleteAccount, updateAccountLabel, postManualAccount };



// WEBPACK FOOTER //
// ./src/api/private/accounts.js