import { CustomerService } from '../../../src/modules/customers/application/customer.service';
import { Customer } from '../../../src/modules/customers/domain/customer.entity';
import { DocumentType } from '../../../src/modules/customers/domain/enums/document-type.enum';
import { CustomerNotFoundError } from '../../../src/modules/customers/domain/errors/customer-not-found.error';
import { CustomerAlreadyExistsError } from '../../../src/modules/customers/domain/errors/customer-already-exists.error';
import { CustomerHasActiveVehiclesError } from '../../../src/modules/customers/domain/errors/customer-has-active-vehicles.error';

const makeCustomer = () => Customer.restore({
  id: 'customer-1',
  documentType: DocumentType.CPF,
  documentNumber: '11144477735',
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '11999999999',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('CustomerService', () => {
  let service: CustomerService;
  let repo: { findById: jest.Mock; findByDocument: jest.Mock; findAll: jest.Mock; save: jest.Mock; exists: jest.Mock; hasActiveVehicles: jest.Mock };
  let logger: { log: jest.Mock; warn: jest.Mock; error: jest.Mock };

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      findByDocument: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn(),
      hasActiveVehicles: jest.fn(),
    };
    logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
    service = new CustomerService(repo as any, logger as any);
  });

  describe('create', () => {
    it('creates customer when document is unique', async () => {
      repo.exists.mockResolvedValue(false);
      const result = await service.create({ documentType: DocumentType.CPF, documentNumber: '11144477735', name: 'João', email: 'j@e.com', phone: '11999999999' });
      expect(repo.save).toHaveBeenCalled();
      expect(result.documentNumber).toBe('11144477735');
    });

    it('throws CustomerAlreadyExistsError when document exists', async () => {
      repo.exists.mockResolvedValue(true);
      await expect(service.create({ documentType: DocumentType.CPF, documentNumber: '11144477735', name: 'João', email: 'j@e.com', phone: '11999999999' }))
        .rejects.toThrow(CustomerAlreadyExistsError);
    });
  });

  describe('findById', () => {
    it('returns customer when found', async () => {
      repo.findById.mockResolvedValue(makeCustomer());
      const result = await service.findById('customer-1');
      expect(result.id).toBe('customer-1');
    });

    it('throws CustomerNotFoundError when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findById('missing')).rejects.toThrow(CustomerNotFoundError);
    });
  });

  describe('deactivate', () => {
    it('deactivates customer when no active vehicles', async () => {
      const customer = makeCustomer();
      repo.findById.mockResolvedValue(customer);
      repo.hasActiveVehicles.mockResolvedValue(false);
      await service.deactivate('customer-1');
      expect(customer.active).toBe(false);
      expect(repo.save).toHaveBeenCalled();
    });

    it('throws CustomerHasActiveVehiclesError when vehicles exist', async () => {
      repo.findById.mockResolvedValue(makeCustomer());
      repo.hasActiveVehicles.mockResolvedValue(true);
      await expect(service.deactivate('customer-1')).rejects.toThrow(CustomerHasActiveVehiclesError);
    });

    it('throws CustomerNotFoundError when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.deactivate('missing')).rejects.toThrow(CustomerNotFoundError);
    });
  });

  describe('update', () => {
    it('updates allowed fields', async () => {
      const customer = makeCustomer();
      repo.findById.mockResolvedValue(customer);
      const result = await service.update('customer-1', { name: 'New Name', email: 'new@email.com' });
      expect(result.name).toBe('New Name');
      expect(repo.save).toHaveBeenCalled();
    });

    it('throws CustomerNotFoundError when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('missing', {})).rejects.toThrow(CustomerNotFoundError);
    });
  });
});
