function converterJSON() {
  var jsonSchemaInput = document.getElementById("jsonSchemaInput").value;

  try {
      var originalSchema = JSON.parse(jsonSchemaInput);
  } catch (error) {
      document.getElementById("result").innerText = "Erro: Insira um JSON Schema válido.";
      return;
  }

  var resultado = criarNovoSchemaElocales(originalSchema);

  document.getElementById("result").innerText = "Conversão concluída com sucesso!";
  document.getElementById("result-schema").innerText = JSON.stringify(resultado.novoSchema, null, 2);
  document.getElementById("result-locales").innerText = JSON.stringify(resultado.novoLocales, null, 2);
}

function criarNovoSchemaElocales(originalSchema) {
  var sequencialId = 1;

  function gerarId() {
      return "auto_id_" + sequencialId++;
  }

  function processarConfiguracao(configuracao, caminho) {
      var novoSchema = {};
      var novoLocales = {};

      var id = configuracao.id || gerarId();
      var chave = caminho ? caminho + "." + id : id;

      if (configuracao.type) {
          novoSchema[chave] = "t:" + chave + ".label";
      }

      novoLocales[chave] = {};

      if (configuracao.label) {
          novoLocales[chave].label = "";
      }

      if (configuracao.placeholder) {
          novoLocales[chave].placeholder = "";
      }

      if (configuracao.unit) {
          novoLocales[chave].unit = "";
      }

      if (configuracao.info) {
          novoLocales[chave].info = "";
      }

      if (configuracao.settings) {
          novoSchema[chave] = {};
          novoLocales[chave] = {};

          for (var subConfig in configuracao.settings) {
              var resultadoSub = processarConfiguracao(configuracao.settings[subConfig], chave);
              Object.assign(novoSchema[chave], resultadoSub.novoSchema);
              Object.assign(novoLocales[chave], resultadoSub.novoLocales);
          }
      }

      return { novoSchema, novoLocales };
  }

  var resultadoFinal = processarConfiguracao(originalSchema, null);

  // Substituir auto_id_ por identificadores reais no novo schema
  resultadoFinal.novoSchema = substituirAutoIds(resultadoFinal.novoSchema, originalSchema);

  return resultadoFinal;
}

function substituirAutoIds(novoSchema, originalSchema) {
  var autoIdRegex = /auto_id_(\d+)/g;

  return JSON.parse(JSON.stringify(novoSchema, (key, value) => {
      if (typeof value === 'string' && value.match(autoIdRegex)) {
          var match = autoIdRegex.exec(value);
          var autoIdIndex = parseInt(match[1]);
          return encontrarIdCorrespondente(autoIdIndex, originalSchema);
      }
      return value;
  }));
}

function encontrarIdCorrespondente(autoIdIndex, originalSchema) {
  var idsEncontrados = [];
  function encontrarIds(configuracao) {
      if (configuracao.id && configuração.id.startsWith('auto_id_')) {
          idsEncontrados.push(configuracao.id);
      }

      if (configuracao.settings) {
          for (var subConfig in configuracao.settings) {
              encontrarIds(configuracao.settings[subConfig]);
          }
      }
  }

  encontrarIds(originalSchema);

  return idsEncontrados[autoIdIndex - 1];
}
