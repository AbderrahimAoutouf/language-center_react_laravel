import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { UseStateContext } from '../../context/ContextProvider';

const AddExpense = () => {
  const { user, setNotification, setVariant } = UseStateContext();
  const navigate = useNavigate();

  let routePrefix = '';
  if (user?.role === 'director') routePrefix = '/director';
  else if (user?.role === 'secretary') routePrefix = '/secretary';

  const initialValues = {
    name: '',
    description: '',
    amount: '',
    quantity: '',
    paymentType: '',
    itemDetails: '',
    discount: '',
    totalOverride: '',
    purchasedBy: '',
    purchasedFrom: '',
    totalAmount: 0, // New field for total amount calculation
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Expense name is required'),
    amount: Yup.number().required('Amount is required'),
    quantity: Yup.number().required('Quantity is required'),
    paymentType: Yup.string().required('Payment type is required'),
    itemDetails: Yup.string().required('Item details are required'),
    purchasedBy: Yup.string().required('Purchased by is required'),
    purchasedFrom: Yup.string().required('Vendor name is required'),
    description: Yup.string(),
    discount: Yup.number(),
    totalOverride: Yup.number(),
  });

  // Handle submit form
  const handleSubmit = async (values) => {
    const dataToSend = {
      expense_name: values.name,
      expense_description: values.description,
      expense_amount: values.amount,
      quantity: values.quantity,
      payment_type: values.paymentType,
      item_details: values.itemDetails,
      discount: values.discount || 0,
      total_override: values.totalOverride || null,
      purchased_by: values.purchasedBy,
      purchased_from: values.purchasedFrom,
      total_amount: values.totalOverride || values.totalAmount, // Use override if available
    };

    try {
      await axios.post('/api/expenses', dataToSend);
      setNotification('Expense added successfully');
      setVariant('success');
      setTimeout(() => {
        setNotification('');
        setVariant('');
      }, 3000);
      navigate(`${routePrefix}/fees/expenses`);
    } catch (error) {
      console.error('Failed to add expense:', error);
      setNotification('Failed to add expense');
      setVariant('danger');
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {(formik) => {
        const calculateTotalAmount = () => {
          const { amount, quantity, discount } = formik.values;
          let total = amount * quantity;
          if (discount) {
            total -= (total * discount) / 100; // Apply discount as percentage
          }
          return total;
        };

        return (
          <Form onSubmit={formik.handleSubmit} className="p-4 shadow-sm bg-white rounded">
            <h2 className="mb-4">Add Expense</h2>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Expense Name *</Form.Label>
                <Form.Control
                  type="text"
                  {...formik.getFieldProps('name')}
                  isInvalid={formik.touched.name && formik.errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.name}
                </Form.Control.Feedback>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  {...formik.getFieldProps('description')}
                  isInvalid={formik.touched.description && formik.errors.description}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.description}
                </Form.Control.Feedback>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Label>Amount (per item) *</Form.Label>
                <Form.Control
                  type="number"
                  {...formik.getFieldProps('amount')}
                  isInvalid={formik.touched.amount && formik.errors.amount}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.amount}
                </Form.Control.Feedback>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Label>Quantity *</Form.Label>
                <Form.Control
                  type="number"
                  {...formik.getFieldProps('quantity')}
                  isInvalid={formik.touched.quantity && formik.errors.quantity}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.quantity}
                </Form.Control.Feedback>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Label>Discount (optional)</Form.Label>
                <Form.Control
                  type="number"
                  {...formik.getFieldProps('discount')}
                  isInvalid={formik.touched.discount && formik.errors.discount}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.discount}
                </Form.Control.Feedback>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Total Override (optional)</Form.Label>
                <Form.Control
                  type="number"
                  {...formik.getFieldProps('totalOverride')}
                  isInvalid={formik.touched.totalOverride && formik.errors.totalOverride}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.totalOverride}
                </Form.Control.Feedback>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Payment Type *</Form.Label>
                <Form.Control
                  as="select"
                  {...formik.getFieldProps('paymentType')}
                  isInvalid={formik.touched.paymentType && formik.errors.paymentType}
                >
                  <option value="">Select payment type</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {formik.errors.paymentType}
                </Form.Control.Feedback>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Item Details *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., 3 office chairs, 1 table"
                  {...formik.getFieldProps('itemDetails')}
                  isInvalid={formik.touched.itemDetails && formik.errors.itemDetails}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.itemDetails}
                </Form.Control.Feedback>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Purchased By *</Form.Label>
                <Form.Control
                  type="text"
                  {...formik.getFieldProps('purchasedBy')}
                  isInvalid={formik.touched.purchasedBy && formik.errors.purchasedBy}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.purchasedBy}
                </Form.Control.Feedback>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>Purchased From (Vendor) *</Form.Label>
                <Form.Control
                  type="text"
                  {...formik.getFieldProps('purchasedFrom')}
                  isInvalid={formik.touched.purchasedFrom && formik.errors.purchasedFrom}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.purchasedFrom}
                </Form.Control.Feedback>
              </Col>

              {/* Displaying the total amount */}
              <Col md={6} className="mb-3">
                <Form.Label>Total Amount</Form.Label>
                <Form.Control
                  type="number"
                  value={formik.values.totalOverride || calculateTotalAmount()}
                  readOnly
                />
              </Col>
            </Row>

            <div className="text-end mt-3">
              <Button type="submit" variant="primary">
                Add Expense
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AddExpense;
