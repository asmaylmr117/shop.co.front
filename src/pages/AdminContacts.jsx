import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEye,
  FiTrash2,
  FiSearch,
  FiX,
  FiMail,
  FiCalendar,
  FiUser,
  FiAlertCircle,
  FiCheck
} from 'react-icons/fi';

export default function AdminContacts() {
  const { getAuthHeaders, userRole } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const API_BASE_URL = 'https://shopbackco.vercel.app';

  useEffect(() => {
    if (userRole !== 'admin') {
      setError('Access denied. Admin privileges required.');
      return;
    }
    fetchContacts();
  }, [userRole]);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Contact API response:", data);
        
        let fetchedContacts = [];
        if (Array.isArray(data)) {
          fetchedContacts = data;
        } else if (data && typeof data === 'object') {
          // Look for an array in the properties (e.g. data.contacts, data.data, data.messages)
          if (Array.isArray(data.contacts)) {
            fetchedContacts = data.contacts;
          } else if (Array.isArray(data.data)) {
            fetchedContacts = data.data;
          } else {
            // Find the first array property in the object
            const arrayProperty = Object.values(data).find(val => Array.isArray(val));
            if (arrayProperty) {
              fetchedContacts = arrayProperty;
            }
          }
        }
        
        setContacts(fetchedContacts);
      } else {
        throw new Error('Failed to fetch contacts');
      }
    } catch (err) {
      setError('Failed to load contacts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleDeleteContact = async (contactId) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact/${contactId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setSuccess('Contact message deleted successfully');
        await fetchContacts();
        setShowDeleteModal(false);
        setContactToDelete(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete contact');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDeleteContact = (contact) => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  const safeContacts = Array.isArray(contacts) ? contacts : [];
  const filteredContacts = safeContacts.filter(contact => {
    const matchesSearch =
      (contact.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (contact.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (contact.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    return matchesSearch;
  });

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <FiAlertCircle className="mx-auto text-red-500 text-5xl mb-4" />
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading && contacts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contact Messages Management</h1>
              <p className="text-gray-600 mt-1">View and manage customer contact messages</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={fetchContacts}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
              >
                {loading ? 'Refreshing...' : 'Refresh Contacts'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <FiX />
              </button>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
              <FiCheck className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <FiX />
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Contact Messages ({filteredContacts.length})</h3>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <FiMail className="mx-auto text-gray-400 text-4xl mb-4" />
              <p className="text-gray-500 text-lg">No contact messages found</p>
              <p className="text-gray-400 mt-1">
                {contacts.length === 0
                  ? "No messages have been submitted yet."
                  : "Try adjusting your search criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <motion.tr
                      key={contact.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FiUser className="text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                            <div className="text-sm text-gray-500">{contact.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{contact.subject}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <FiCalendar className="text-gray-400" />
                          <span>{new Date(contact.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowContactModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50"
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => confirmDeleteContact(contact)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                            title="Delete Message"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showDeleteModal && contactToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <FiAlertCircle className="w-6 h-6 text-red-600" />
                </div>

                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                  Delete Contact Message
                </h3>

                <p className="text-sm text-gray-500 text-center mb-6">
                  Are you sure you want to delete this message from {contactToDelete.name}? This action cannot be undone.
                </p>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contactToDelete.id)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showContactModal && selectedContact && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowContactModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg w-full max-w-lg mx-2 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 md:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Contact Message Details</h2>
                    <button
                      onClick={() => setShowContactModal(false)}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    >
                      <FiX size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        <FiUser className="mr-2 text-sm" /> Customer Info
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedContact.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium truncate max-w-[150px]">{selectedContact.email}</span>
                        </div>
                        {selectedContact.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{selectedContact.phone}</span>
                          </div>
                        )}
                        {selectedContact.orderNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Number:</span>
                            <span className="font-medium">{selectedContact.orderNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        <FiMail className="mr-2 text-sm" /> Message Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Subject:</span>
                          <p className="font-medium text-gray-900 mt-1">{selectedContact.subject}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Message:</span>
                          <p className="font-medium text-gray-900 mt-1 whitespace-pre-wrap">{selectedContact.message}</p>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">
                            {new Date(selectedContact.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setShowContactModal(false)}
                      className="px-4 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
