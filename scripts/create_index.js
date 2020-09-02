const child_process = require('child_process');
const config = require('pelias-config').generate();
const es = require('elasticsearch');
const SUPPORTED_ES_VERSIONS = '>=7.4.2';

const cli = require('./cli');
const schema = require('../schema');

// check if the patch to rename the geo_shape property has been applied. If not exit.
if(schema.mappings.properties.polygon == null){
  console.error("The polygon patch has not been applied. Please apply the schema.patch and try again.");
  process.exit(1);
}else{
  console.log("\n The schema.patch has been applied, the polygon geo_shape is present.");
}

// check that the polygon has been excluded from the _source as it is too big.
if(schema.mappings._source.excludes[0] !== 'polygon'){
  console.error("The polygon has not been excluded from the _source. Please add this to the _source:excludes property and try again.");
  process.exit(1);
}else{
  console.log("\n The polygon has been excluded from the _source.");
}

cli.header("create index");

const client = new es.Client(config.esclient);

// check minimum elasticsearch versions before continuing
try {
  child_process.execSync(`node ${__dirname}/check_version.js "${SUPPORTED_ES_VERSIONS}"`);
} catch (e) {
  console.error(`unsupported elasticsearch version. try: ${SUPPORTED_ES_VERSIONS}\n`);
  process.exit(1);
}

// check mandatory plugins are installed before continuing
try {
  child_process.execSync(`node ${__dirname}/check_plugins.js`);
} catch (e) {
  console.error("please install mandatory plugins before continuing.\n");
  process.exit(1);
}

const indexName = config.schema.indexName;
const req = {
  index: indexName,
  body: schema,
  include_type_name: false
};

client.indices.create(req, (err, res) => {
  if (err) {
    console.error(err.message || err, '\n');
    process.exit(1);
  }
  console.log('[put mapping]', '\t', indexName, res, '\n');
  process.exit(!!err);
});
