import { ServiceCatalog } from './service-catalog.entity';
import { Duration } from './value-objects/duration.vo';
import { ServiceId } from './value-objects/service-id.vo';
import { Money } from '@/shared/domain/value-objects/money.vo';

describe('ServiceCatalog Entity', () => {
  const makeEntity = () =>
    ServiceCatalog.create({
      id: ServiceId.fromString('11111111-1111-4111-8111-111111111111') as ServiceId,
      name: 'Troca de oleo',
      description: 'Troca completa de oleo e filtro',
      basePrice: Money.fromCents(15000),
      estimatedDuration: Duration.create(90),
      category: 'MECANICA',
    });

  it('deve criar um service catalog ativo por padrão', () => {
    const service = makeEntity();

    expect(service.name).toBe('Troca de oleo');
    expect(service.active).toBe(true);
    expect(service.category).toBe('MECANICA');
    expect(service.basePrice.cents).toBe(15000);
    expect(service.estimatedDuration.minutes).toBe(90);
  });

  it('deve normalizar category para uppercase', () => {
    const service = ServiceCatalog.create({
      id: ServiceId.fromString('22222222-2222-4222-8222-222222222222') as ServiceId,
      name: 'Alinhamento',
      description: 'Alinhamento de direcao',
      basePrice: Money.fromCents(8000),
      estimatedDuration: Duration.create(45),
      category: 'suspensao',
    });

    expect(service.category).toBe('SUSPENSAO');
  });

  it('deve alterar atributos válidos', () => {
    const service = makeEntity();

    service.changeAttributes({
      name: 'Troca de oleo premium',
      description: 'Com aditivo e filtro premium',
      basePrice: Money.fromCents(20000),
      estimatedDuration: Duration.create(120),
      category: 'PREMIUM',
    });

    expect(service.name).toBe('Troca de oleo premium');
    expect(service.description).toBe('Com aditivo e filtro premium');
    expect(service.basePrice.cents).toBe(20000);
    expect(service.estimatedDuration.minutes).toBe(120);
    expect(service.category).toBe('PREMIUM');
  });

  it('deve desativar e ativar serviço', () => {
    const service = makeEntity();

    service.deactivate();
    expect(service.active).toBe(false);

    service.activate();
    expect(service.active).toBe(true);
  });

  it('deve impedir delete quando ativo', () => {
    const service = makeEntity();

    expect(() => service.ensureCanBeDeleted()).toThrow(
      'Cannot delete an active catalog service. Deactivate it first.',
    );
  });

  it('deve permitir delete quando inativo', () => {
    const service = makeEntity();
    service.deactivate();

    expect(() => service.ensureCanBeDeleted()).not.toThrow();
  });

  it('deve falhar ao criar com nome inválido', () => {
    expect(() =>
      ServiceCatalog.create({
        id: ServiceId.fromString('33333333-3333-4333-8333-333333333333') as ServiceId,
        name: '   ',
        description: 'Descricao ok',
        basePrice: Money.fromCents(1000),
        estimatedDuration: Duration.create(30),
        category: 'MECANICA',
      }),
    ).toThrow('Service name is required');
  });

  it('deve falhar ao criar com descrição inválida', () => {
    expect(() =>
      ServiceCatalog.create({
        id: ServiceId.fromString('44444444-4444-4444-8444-444444444444') as ServiceId,
        name: 'Servico válido',
        description: '   ',
        basePrice: Money.fromCents(1000),
        estimatedDuration: Duration.create(30),
        category: 'MECANICA',
      }),
    ).toThrow('Service description is required');
  });

  it('deve falhar ao criar com categoria inválida', () => {
    expect(() =>
      ServiceCatalog.create({
        id: ServiceId.fromString('55555555-5555-4555-8555-555555555555') as ServiceId,
        name: 'Servico válido',
        description: 'Descricao válida',
        basePrice: Money.fromCents(1000),
        estimatedDuration: Duration.create(30),
        category: '   ',
      }),
    ).toThrow('Service category is required');
  });
});
