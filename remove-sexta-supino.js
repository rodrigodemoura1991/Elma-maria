/* Ajuste oficial: retirar o exercício 6 da sexta-feira (Supino inclinado com halteres).
   Mantém o restante do treino de sexta exatamente igual. */
(function () {
  function apply() {
    if (typeof workouts === 'undefined' || !workouts.Sexta || !Array.isArray(workouts.Sexta.ex)) return;

    const index = workouts.Sexta.ex.findIndex(function (ex) {
      return ex && ex[0] === 'Supino inclinado com halteres';
    });

    if (index !== -1) workouts.Sexta.ex.splice(index, 1);
  }

  apply();

  // O app pode renderizar novamente depois de carregar os registros da nuvem.
  // Intercepta renderizações futuras sem criar outro estado ou outro treino.
  if (typeof window.render === 'function') {
    const originalRender = window.render;
    window.render = function () {
      apply();
      return originalRender.apply(this, arguments);
    };
  }
})();
