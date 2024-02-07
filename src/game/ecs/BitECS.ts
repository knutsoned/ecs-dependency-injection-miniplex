import { NumberType } from '../../types/Ex.It'

import {
  ComponentMap,
  EntityListener,
  IComponent,
  IEntity,
  IManager,
  IQuery,
  ISchema,
  IWorld,
  SchemaArray,
  SchemaEntry,
  Values,
} from '../../types/Ex.Cess'

import {
  addComponent as addBitECSComponent,
  addEntity as addBitECSEntity,
  createWorld as createBitECSWorld,
  defineComponent as defineBitECSComponent,
  defineQuery as defineBitECSQuery,
  enterQuery,
  exitQuery,
  getAllEntities as getAllBitECSEntities,
  hasComponent as hasBitECSComponent,
  IWorld as IBitECSWorld,
  Not,
  Query,
  removeComponent as removeBitECSComponent,
  removeEntity as removeBitECSEntity,
  Types as BitECSTypes,
} from 'bitecs'

export const SCHEMA_TYPES = {
  [NumberType.i8]: BitECSTypes.i8,
  [NumberType.ui8]: BitECSTypes.ui8,
  [NumberType.i16]: BitECSTypes.i16,
  [NumberType.ui16]: BitECSTypes.ui16,
  [NumberType.i32]: BitECSTypes.i32,
  [NumberType.ui32]: BitECSTypes.ui32,
  [NumberType.f32]: BitECSTypes.f32,
  [NumberType.f64]: BitECSTypes.f64,
}

export class BitECSComponent implements IComponent {
  bitECS: any // underlying bitECS component
  name: string

  constructor(name: string, component: any) {
    this.bitECS = component
    this.name = name
  }

  addTo(entity: IEntity): void {
    addBitECSComponent(entity.world, this.bitECS, entity.eid)
  }

  readFrom(entity: IEntity): Values {
    return this.bitECS[entity.eid]
  }

  removeFrom(entity: IEntity): void {
    removeBitECSComponent(entity.world, this.bitECS, entity.eid)
  }

  setOn(entity: IEntity, values: Values): void {
    if (entity.hasComponent(this)) {
      if (typeof values === 'object') {
        for (let propertyName of Object.keys(values)) {
          this.bitECS[propertyName][entity.eid] = values[propertyName]
        }
      }
      return
    }
    entity.addComponent(this, values)
  }
}

export class BitECSEntity implements IEntity {
  eid = 0
  world: BitECSWorld

  constructor(world: BitECSWorld, eid = -1) {
    if (eid === -1) {
      this.eid = addBitECSEntity(world.bitECS)
    } else {
      this.eid = eid
    }
    this.world = world
  }

  addComponent(component: IComponent, values?: Values) {
    component.addTo(this)
    if (values) {
      component.setOn(this, values)
    }
  }

  hasComponent(component: IComponent): boolean {
    return hasBitECSComponent(this.world, component, this.eid)
  }

  readComponent(component: IComponent): Values {
    return component.readFrom(this)
  }

  removeComponent(component: IComponent) {
    component.removeFrom(this)
  }

  setValues(component: IComponent, values: Values): void {
    component.setOn(this, values)
  }
}

type BitECSComponentMap = { [componentName: string]: BitECSComponent }
export class BitECSManager implements IManager {
  bitECSComponentMap: BitECSComponentMap
  componentMap: ComponentMap

  constructor() {
    this.bitECSComponentMap = {}
    this.componentMap = {}
  }

  defineComponent(componentName: string, schemaEntry: SchemaEntry): IComponent {
    let bitECSComponent

    if (schemaEntry) {
      // loop through properties
      const bitECSSchemaComponent: { [propertyName: string]: string } = {}

      for (let propertyName of Object.keys(schemaEntry)) {
        const entryType = schemaEntry[propertyName]
        if (Array.isArray(entryType)) {
          const arrayDef = entryType as SchemaArray
          // FIXME -- define type mapping
          const arrayType = ARRAY_TYPES[arrayDef[0]]
          // FIXME -- pass size to bitECS schema
          if (arrayType) {
            bitECSSchemaComponent[propertyName] = arrayType
          }
        } else {
          const schemaType = SCHEMA_TYPES[entryType]
          if (schemaType) {
            bitECSSchemaComponent[propertyName] = schemaType
          }
        }
        bitECSComponent = defineBitECSComponent(bitECSSchemaComponent)
      }
    } else {
      // handle flag/marker/tag
      bitECSComponent = defineBitECSComponent()
    }

    const component = new BitECSComponent(componentName, bitECSComponent)
    this.bitECSComponentMap[componentName] = component.bitECS
    this.componentMap[componentName] = component
    return component
  }

  registerSchema(schema: ISchema) {
    // convert Ex.It NumberType to bitECS Types

    // loop through components
    for (let componentName of Object.keys(schema.components)) {
      let component: any = schema.components[componentName]
      this.defineComponent(componentName, component)
    }
  }
}

export class BitECSQuery implements IQuery {
  enterListener = (entity: IEntity) => {
    entity
  }
  exitListener = (entity: IEntity) => {
    entity
  }
  query: Query
  withComponents?: IComponent[] | undefined
  withoutComponents?: IComponent[] | undefined
  world: BitECSWorld

  constructor(world: BitECSWorld, query: Query) {
    this.query = query
    this.world = world
  }

  notifyEntered(): void {
    const entered = enterQuery(this.query)(this.world)
    entered.forEach((entity) =>
      this.enterListener(new BitECSEntity(this.world, entity))
    )
  }

  notifyExited(): void {
    const exited = exitQuery(this.query)(this.world)
    exited.forEach((entity) =>
      this.exitListener(new BitECSEntity(this.world, entity))
    )
  }

  defineSubquery(
    withComponents?: IComponent[],
    withoutComponents?: IComponent[]
  ): IQuery {
    let withAll = this.withComponents ? [...this.withComponents] : undefined
    if (withComponents) {
      if (withAll) {
        withAll.concat(withComponents)
      } else {
        withAll = withComponents
      }
    }
    let withoutAll = this.withoutComponents
      ? [...this.withoutComponents]
      : undefined
    if (withoutComponents) {
      if (withoutAll) {
        withoutAll.concat(withoutComponents)
      } else {
        withoutAll = withoutComponents
      }
    }
    return this.world.defineQuery(withAll, withoutAll)
  }

  entities(): IEntity[] {
    return this.query(this.world).map(
      (eid) => new BitECSEntity(this.world, eid)
    )
  }

  registerEnterListener(listener: EntityListener): void {
    this.enterListener = listener
  }

  registerExitListener(listener: EntityListener): void {
    this.exitListener = listener
  }
}

export class BitECSWorld implements IBitECSWorld, IWorld {
  bitECS: IBitECSWorld
  manager: BitECSManager

  constructor(world: IWorld, manager: BitECSManager) {
    this.bitECS = createBitECSWorld(world)
    this.manager = manager
  }

  createEntity(): IEntity {
    return new BitECSEntity(this)
  }

  defineQuery(
    withComponents?: IComponent[],
    withoutComponents?: IComponent[]
  ): IQuery {
    const predicate = []
    if (withComponents) {
      for (let component of withComponents) {
        predicate.push(this.manager.bitECSComponentMap[component.name])
      }
    }
    if (withoutComponents) {
      for (let component of withoutComponents) {
        predicate.push(Not(this.manager.bitECSComponentMap[component.name]))
      }
    }
    return new BitECSQuery(this, defineBitECSQuery(predicate))
  }

  entities(): IEntity[] {
    const allEntities = getAllBitECSEntities(this.bitECS)
    return allEntities.map((entity) => new BitECSEntity(this, entity))
  }

  removeEntity(entity: IEntity) {
    removeBitECSEntity(this, entity.eid)
  }
}
