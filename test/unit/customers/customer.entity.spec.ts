import { Customer } from '../../../src/modules/customers/domain/customer.entity';
import { DocumentType } from '../../../src/modules/customers/domain/enums/document-type.enum';

const makeCustomer = () => Customer.create({
  documentType: DocumentType.CPF,
  documentNumber: '11144477735',
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '11999999999',
});

describe('Customer Entity', () => {
  it('deactivate sets active to false', () => {
    const customer = makeCustomer();
    customer.deactivate();
    expect(customer.active).toBe(false);
  });

  it('activate sets active to true', () => {
    const customer = makeCustomer();
    customer.deactivate();
    customer.activate();
    expect(customer.active).toBe(true);
  });

  it('updateContact updates email and phone', () => {
    const customer = makeCustomer();
    customer.updateContact('new@email.com', '11888888888');
    expect(customer.email).toBe('new@email.com');
    expect(customer.phone).toBe('11888888888');
  });

  it('isOwnedBy returns true for matching document', () => {
    const customer = makeCustomer();
    expect(customer.isOwnedBy('11144477735')).toBe(true);
    expect(customer.isOwnedBy('111.444.777-35')).toBe(true);
  });
});
