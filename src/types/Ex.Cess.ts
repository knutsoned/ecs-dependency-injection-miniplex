import { IEntity as ExItEntity, IWorld as ExItWorld, NumberType } from './Ex.It'

/*
An entity represents an object of some type in a world.
It has a ui32 identifier.
*/
export interface IEntity extends ExItEntity {
  eid: number
  world: IWorld

  // add component to an entity, setting values if not a flag/marker/tag
  addComponent(component: IComponent, values?: Values): void

  // check if component exists
  hasComponent(component: IComponent): boolean

  // get all values of a component for this entity
  readComponent(component: IComponent): Values

  // remove the component from the entity
  removeComponent(component: IComponent): void

  // set an individual value
  setValues(component: IComponent, values: Values): void
}

// A component is a named type associated with an entity.
export interface IComponent {
  name: string

  // add the component to the entity
  addTo(entity: IEntity): void

  // read the value of the component from the entity
  readFrom(entity: IEntity): Values

  // remove the component from the entity
  removeFrom(entity: IEntity): void

  // replace the values for the component on the entity, adding if needed
  setOn(entity: IEntity, values: Values): void
}

// A map of component names to components.
export type ComponentMap = { [componentName: string]: IComponent }

/*
A manager handles defining components from a schema.

Multiple worlds can share the same components. Each entity is associated with a
specific world, so the value associated with a component of an entity is
specific to a world as well.
*/
export interface IManager {
  // retrieve a component using the name defined in the schema
  componentMap: ComponentMap

  // optional function to define a component individually
  defineComponent?(componentName: string, schemaEntry: SchemaEntry): IComponent

  // define components en masse
  registerSchema(schema: ISchema): void
}

// A schema is a map of component names to definitions.
export interface ISchema {
  components: SchemaDefinition
}

export type EntityListener = (entity: IEntity) => void

/*
A query uses a list of components that must be present and/or
a list of components that must not be present.

Some ECS libraries allow additional "where" conditions.

Ex.Cess does not.
*/
export interface IQuery {
  withComponents?: IComponent[]
  withoutComponents?: IComponent[]

  defineSubquery(
    withComponents?: IComponent[],
    withoutComponents?: IComponent[]
  ): IQuery
  entities(): IEntity[]
  notifyEntered(): void // notify enter listeners
  notifyExited(): void // notify exit listeners
  registerEnterListener(fn: (entity: IEntity) => void): void
  registerExitListener(fn: (entity: IEntity) => void): void
}

/*
A schema definition is either an object mapping string properties to numbers
or a string that names a flag/marker/tag.

Some ECS libraries allow nested objects in the schema:
{
  health: {
    currentHealth: number,
    maxHealth: number,
  }
}

Ex.Cess does not.
*/

// array of numbers of a certain length
export type SchemaArray = [arrayOf: NumberType, size: number]

export type SchemaEntry =
  /*
  map of properties
  values are a scalar number or an array of numbers
  strings are stored as an id in a flyweight system
  references to other entities are stored by (ui32) eid
  undefined means property is just a flag/marker/tag
  */
  { [propertyName: string]: NumberType | SchemaArray } | undefined

export type SchemaDefinition = { [componentName: string]: SchemaEntry }

export type Values = { [propertyName: string]: number | number[] } | undefined

// very commonly used types
export const Vector2: SchemaEntry = {
  x: NumberType.f64,
  y: NumberType.f64,
}

export const Vector3: SchemaEntry = Object.assign(Vector2, {
  z: NumberType.f64,
})

// A world is a collection and factory of entities and queries.
export interface IWorld extends ExItWorld {
  createEntity(): IEntity

  // a query with neither component array returns all entities
  defineQuery(
    withComponents?: IComponent[],
    withoutComponents?: IComponent[]
  ): IQuery

  // generally shorthand for defineQuery().entities()
  entities(): IEntity[]
}
