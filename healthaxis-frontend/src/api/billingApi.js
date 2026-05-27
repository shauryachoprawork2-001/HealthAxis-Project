import axiosInstance from './axiosInstance'
export const billingApi = {
  getPatientInvoices: (patientId, params) => axiosInstance.get(`/billing/patient/${patientId}`, { params }),
  pay: (invoiceId, amount, method, transactionId) =>
    axiosInstance.post(`/billing/${invoiceId}/pay`, null, { params: { amount, method, transactionId } }),
}
