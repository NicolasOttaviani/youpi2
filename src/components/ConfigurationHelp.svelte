<script lang="ts">
  export let type
</script>

<style lang="scss">
  dl {
    border: 3px solid var(--primary);
    border-radius: 25px;
    max-width: 500px;
    margin: 30px auto;
    dt {
      background: var(--primary);
      color: var(--color);
      padding: 5px 10px;
      font-size: 32px;
      border-radius: 20px;
    }
  }
</style>

{#if type}
  <dl>
    {#if type === 'restitution'}
      <dt>Help: Restitution</dt>
      <dd>
        <p>
          A Number that defines the restitution (elasticity) of the body. The
          value is always positive and is in the range (0, 1). A value of 0
          means collisions may be perfectly inelastic and no bouncing may occur.
          A value of 0.8 means the body may bounce back with approximately 80%
          of its kinetic energy. Note that collision response is based on pairs
          of bodies, and that restitution values are combined with the following
          formula:
        </p>
        <code>Math.max(bodyA.restitution, bodyB.restitution)</code>
        <span>Default: 0</span>
      </dd>
    {:else if type === 'friction'}
      <dt>Help: Friction</dt>
      <dd>
        <p>
          A Number that defines the friction of the body. The value is always
          positive and is in the range (0, 1). A value of 0 means that the body
          may slide indefinitely. A value of 1 means the body may come to a stop
          almost instantly after a force is applied.
        </p>
        <p>
          The effects of the value may be non-linear. High values may be
          unstable depending on the body. The engine uses a Coulomb friction
          model including static and kinetic friction. Note that collision
          response is based on pairs of bodies, and that friction values are
          combined with the following formula:
        </p>
        <code>Math.min(bodyA.friction, bodyB.friction)</code>
      </dd>
    {:else if type === 'mass'}
      <dt>Help: Mass</dt>
      <dd>
        <p>A Number that defines the mass of the body</p>
      </dd>
    {:else if type === 'inertia'}
      <dt>Help: Inertia</dt>
      <dd>
        <p>
          A Number that defines the moment of inertia (i.e. second moment of
          area) of the body. It is automatically calculated from the given
          convex hull (vertices array) and density in Body.create.
        </p>
      </dd>
    {:else if type === 'frictionAir'}
      <dt>Help: Air friction</dt>
      <dd>
        <p>
          A Number that defines the air friction of the body (air resistance). A
          value of 0 means the body will never slow as it moves through space.
          The higher the value, the faster a body slows when moving through
          space. The effects of the value are non-linear.
        </p>
      </dd>
    {:else if type === 'slop'}
      <dt>Help: Slop</dt>
      <dd>
        <p>
          A Number that specifies a tolerance on how far a body is allowed to
          'sink' or rotate into other bodies. Avoid changing this value unless
          you understand the purpose of slop in physics engines. The default
          (0.05) should generally suffice, although very large bodies may
          require larger values for stable stacking.
        </p>
      </dd>
    {:else if type === 'slop'}
      <dt>Help: Slop</dt>
      <dd>
        <p>
          A Number that specifies a tolerance on how far a body is allowed to
          'sink' or rotate into other bodies. Avoid changing this value unless
          you understand the purpose of slop in physics engines. The default
          (0.05) should generally suffice, although very large bodies may
          require larger values for stable stacking.
        </p>
      </dd>
    {/if}
  </dl>
{/if}
