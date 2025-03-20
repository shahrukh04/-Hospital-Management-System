import { body } from 'express-validator';

/**
 * Validation rules for appointment creation and updates
 */
export const appointmentValidation = [
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isMongoId()
    .withMessage('Invalid patient ID format'),
    
  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isMongoId()
    .withMessage('Invalid doctor ID format'),
    
  body('departmentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID format'),
    
  body('appointmentType')
    .notEmpty()
    .withMessage('Appointment type is required')
    .isIn(['new', 'follow-up', 'emergency', 'consultation', 'procedure', 'checkup'])
    .withMessage('Invalid appointment type'),
    
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
    
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
    
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
    
  body('duration')
    .optional()
    .isInt({ min: 5, max: 240 })
    .withMessage('Duration must be between 5 and 240 minutes'),
    
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
    
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
    
  body('insurance')
    .optional()
    .isObject()
    .withMessage('Insurance must be an object'),
    
  body('insurance.provider')
    .optional()
    .isString()
    .withMessage('Insurance provider must be a string'),
    
  body('insurance.policyNumber')
    .optional()
    .isString()
    .withMessage('Policy number must be a string'),
    
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
];

/**
 * Validation rules for appointment cancellation
 */
export const appointmentCancellationValidation = [
  body('cancellationReason')
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isString()
    .withMessage('Cancellation reason must be a string')
    .isLength({ min: 3, max: 200 })
    .withMessage('Cancellation reason must be between 3 and 200 characters')
];