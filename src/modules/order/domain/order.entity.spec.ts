import { Order } from './order.entity';
import { OrderItem } from './value-objects/order-item.vo';

describe('Order Entity', () => {
  const baseProps = {
    customerCpf: '12345678900',
    customerName: 'Maria Silva',
    customerPhone: '11999999999',
    vehiclePlate: 'ABC1234',
    vehicleBrand: 'Toyota',
    vehicleModel: 'Corolla',
    vehicleYear: 2020,
    branchId: '2c3f9b86-7a5d-4f3a-9a3a-9a4f2f7f1d11',
  };

  it('deve criar ordem com status inicial RECEIVED', () => {
    const order = Order.create(baseProps);

    expect(order.status).toBe('RECEIVED');
    expect(order.items).toHaveLength(0);
    expect(order.totalAmount).toBe(0);
  });

  it('deve permitir transicao valida RECEIVED -> DIAGNOSIS', () => {
    const order = Order.create(baseProps);

    order.transitionTo('DIAGNOSIS');

    expect(order.status).toBe('DIAGNOSIS');
  });

  it('deve bloquear transicao invalida RECEIVED -> PAID', () => {
    const order = Order.create(baseProps);

    expect(() => order.transitionTo('PAID')).toThrow(
      'Invalid status transition: RECEIVED -> PAID',
    );
  });

  it('deve adicionar item e recalcular totalAmount', () => {
    const order = Order.create(baseProps);

    const item = OrderItem.create({
      itemId: 'svc-001',
      type: 'SERVICE',
      name: 'Troca de oleo',
      unitPrice: 150,
      quantity: 2,
    });

    order.addItem(item);

    expect(order.items).toHaveLength(1);
    expect(order.totalAmount).toBe(300);
  });

  it('deve remover item por itemId', () => {
    const order = Order.create(baseProps);

    const item1 = OrderItem.create({
      itemId: 'svc-001',
      type: 'SERVICE',
      name: 'Troca de oleo',
      unitPrice: 100,
      quantity: 1,
    });

    const item2 = OrderItem.create({
      itemId: 'prt-001',
      type: 'PART',
      name: 'Filtro de oleo',
      unitPrice: 50,
      quantity: 2,
    });

    order.addItem(item1);
    order.addItem(item2);

    order.removeItem('svc-001');

    expect(order.items).toHaveLength(1);
    expect(order.items[0].itemId).toBe('prt-001');
    expect(order.totalAmount).toBe(100);
  });

  it('deve serializar para primitives com total calculado', () => {
    const order = Order.create(baseProps);

    order.addItem(
      OrderItem.create({
        itemId: 'svc-010',
        type: 'SERVICE',
        name: 'Alinhamento',
        unitPrice: 80,
        quantity: 1,
      }),
    );

    const dto = order.toPrimitives();

    expect(dto.status).toBe('RECEIVED');
    expect(dto.totalAmount).toBe(80);
    expect(dto.items[0]).toMatchObject({
      itemId: 'svc-010',
      type: 'SERVICE',
      unitPrice: 80,
      quantity: 1,
      subtotal: 80,
    });
  });
});
