export const DOCUMENT_TYPES = Object.freeze({
  USER_DOCUMENT: 'user_document',
  DRIVER_LICENSE: 'driver_license',
  DELIVERY_PROOF: 'delivery_proof'
});


export const UPLOAD_FIELDS = Object.freeze({
  USER_DOCUMENT: 'document',
  DELIVERY_PROOF: 'proof'
});


export const UPLOAD_DIRECTORIES = Object.freeze({
  USER_DOCUMENTS: 'users/documents',
  DELIVERY_PROOFS: 'deliveries/proofs'
});


export const ALLOWED_FILE_TYPES = Object.freeze([
  'application/pdf',
  'image/jpeg',
  'image/png'
]);


export const MAX_FILE_SIZE = 5 * 1024 * 1024;
