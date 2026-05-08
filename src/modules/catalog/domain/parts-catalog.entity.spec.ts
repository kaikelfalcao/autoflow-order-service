import { PartsCatalog, PartCatalogId } from './parts-catalog.entity';
import { Money } from '@/shared/domain/value-objects/money.vo';

describe('PartsCatalog Entity', () => {
  const makeEntity = () =>
    PartsCatalog.create({
      id: PartCatalogId.fromString('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') as PartCatalogId,
      name: 'Filtro de oleo',
      description: 'Filtro para motor 1.6',
      unitPrice: Money.fromCents(4500),
      stockQuantity: 10,
      minStock: 3,
      supplier: 'Fornecedor XPTO',
    });

  it('deve criar peça ativa por padrão', () => {
    const part = makeEntity();

    expect(part.name).toBe('Filtro de oleo');
    expect(part.active).toBe(true);
    expect(part.stockQuantity).toBe(10);
    expect(part.minStock).toBe(3);
    expect(part.isLowStock).toBe(false);
  });

  it('deve ajustar estoque com entrada e saída', () => {
    const part = makeEntity();

    part.replenish(5);
    expect(part.stockQuantity).toBe(15);

    part.reserve(4);
    expect(part.stockQuantity).toBe(11);
  });

  it('deve validar canFulfill corretamente', () => {
    const part = makeEntity();

    expect(part.canFulfill(5)).toBe(true);
    expect(part.canFulfill(10)).toBe(true);
    expect(part.canFulfill(11)).toBe(false);
    expect(part.canFulfill(0)).toBe(false);
  });

  it('deve marcar low stock quando estoque <= minStock', () => {
    const part = makeEntity();

    part.reserve(7); // 10 -> 3
    expect(part.stockQuantity).toBe(3);
    expect(part.isLowStock).toBe(true);
  });

  it('deve lançar erro ao reservar mais do que o estoque', () => {
    const part = makeEntity();

    expect(() => part.reserve(11)).toThrow('Insufficient stock');
  });

  it('deve lançar erro para delta inválido em adjustStock', () => {
    const part = makeEntity();

    expect(() => part.adjustStock(0)).toThrow(
      'Stock delta must be a non-zero integer',
    );
  });

  it('deve alterar atributos válidos', () => {
    const part = makeEntity();

    part.changeAttributes({
      name: 'Filtro de ar',
      description: 'Filtro esportivo',
      unitPrice: Money.fromCents(7000),
      minStock: 2,
      supplier: 'Fornecedor Y',
    });

    expect(part.name).toBe('Filtro de ar');
    expect(part.description).toBe('Filtro esportivo');
    expect(part.unitPrice.cents).toBe(7000);
    expect(part.minStock).toBe(2);
    expect(part.supplier).toBe('Fornecedor Y');
  });

  it('deve permitir supplier null', () => {
    const part = makeEntity();

    part.changeAttributes({ supplier: null });

    expect(part.supplier).toBeNull();
  });

  it('deve desativar e ativar peça', () => {
    const part = makeEntity();

    part.deactivate();
    expect(part.active).toBe(false);

    part.activate();
    expect(part.active).toBe(true);
  });

  it('deve impedir delete quando ativo', () => {
    const part = makeEntity();

    expect(() => part.ensureCanBeDeleted()).toThrow(
      'Cannot delete an active catalog part. Deactivate it first.',
    );
  });

  it('deve permitir delete quando inativo', () => {
    const part = makeEntity();
    part.deactivate();

    expect(() => part.ensureCanBeDeleted()).not.toThrow();
  });

  it('deve falhar ao criar com estoque inicial inválido', () => {
    expect(() =>
      PartsCatalog.create({
        id: PartCatalogId.fromString('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') as PartCatalogId,
        name: 'Peça inválida',
        description: 'Desc',
        unitPrice: Money.fromCents(1000),
        stockQuantity: -1,
        minStock: 0,
      }),
    ).toThrow('stockQuantity must be a non-negative integer');
  });

  it('deve falhar ao criar com minStock inválido', () => {
    expect(() =>
      PartsCatalog.create({
        id: PartCatalogId.fromString('cccccccc-cccc-4ccc-8ccc-cccccccccccc') as PartCatalogId,
        name: 'Peça inválida',
        description: 'Desc',
        unitPrice: Money.fromCents(1000),
        stockQuantity: 1,
        minStock: -1,
      }),
    ).toThrow('minStock must be a non-negative integer');
  });
});
