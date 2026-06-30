import { Country, State } from 'country-state-city';
import lookup from 'country-code-lookup';
import pg from 'pg';

export interface CountryRecord {
  id: number;
  iso2: string;
  iso3: string | null;
  official_name: string;
  native_name: string;
  flag_emoji: string;
  phone_code: string;
  currency_code: string | null;
  currency_name: string | null;
  timezones: string;
  active: boolean;
}

export interface StateRecord {
  id: number;
  country_id: number;
  iso_state_code: string;
  official_name: string;
  admin_type: string;
  active: boolean;
}

/**
 * Creates locations-related tables in Postgres if they do not exist
 */
export async function createLocationsSchema(client: pg.PoolClient) {
  console.log('⚡ Ensuring Global Location System tables exist in PostgreSQL...');
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS countries (
      id SERIAL PRIMARY KEY,
      iso2 VARCHAR(10) UNIQUE NOT NULL,
      iso3 VARCHAR(10),
      official_name VARCHAR(255) NOT NULL,
      native_name VARCHAR(255),
      flag_emoji VARCHAR(50),
      phone_code VARCHAR(50),
      currency_code VARCHAR(50),
      currency_name VARCHAR(255),
      timezones TEXT,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS states (
      id SERIAL PRIMARY KEY,
      country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
      iso_state_code VARCHAR(50) NOT NULL,
      official_name VARCHAR(255) NOT NULL,
      admin_type VARCHAR(100),
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (country_id, iso_state_code, official_name)
    )
  `);

  // Index optimizations for rapid search, ordering, and lazy loading
  await client.query(`CREATE INDEX IF NOT EXISTS idx_countries_active ON countries(active)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_countries_iso2 ON countries(iso2)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_states_country_id ON states(country_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_states_active ON states(active)`);
  
  console.log('⚡ Global Location System tables and indexes verified.');
}

/**
 * Seeds the PostgreSQL locations tables from the country-state-city standard library if empty
 */
export async function seedLocationsPostgres(client: pg.PoolClient) {
  const countRes = await client.query('SELECT COUNT(*) as count FROM countries');
  const count = parseInt(countRes.rows[0].count, 10);
  
  if (count > 0) {
    console.log('⚡ Locations database already contains records. Skipping seeding.');
    return;
  }

  console.log('🌱 Seeding Global Location System in Neon PostgreSQL...');
  
  const countries = Country.getAllCountries();
  console.log(`🌱 Found ${countries.length} ISO 3166 countries from NPM database. Initiating high-speed transactional load...`);

  for (const c of countries) {
    let iso3: string | null = null;
    try {
      const lookupResult = lookup.byIso(c.isoCode);
      iso3 = lookupResult ? lookupResult.iso3 : null;
    } catch (e) {
      // Graceful fallback for non-standard territories
    }

    const currencyCode = c.currency || null;
    const nativeName = c.name;
    const currencyName = currencyCode ? `${currencyCode} Currency` : null;
    const timezonesJson = JSON.stringify(c.timezones || []);

    const res = await client.query(
      `INSERT INTO countries (iso2, iso3, official_name, native_name, flag_emoji, phone_code, currency_code, currency_name, timezones, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (iso2) DO UPDATE SET official_name = EXCLUDED.official_name
       RETURNING id`,
      [c.isoCode, iso3, c.name, nativeName, c.flag, c.phonecode, currencyCode, currencyName, timezonesJson, true]
    );

    const countryId = res.rows[0].id;

    // Fetch and batch-insert all official states/divisions for this country
    const states = State.getStatesOfCountry(c.isoCode);
    if (states && states.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < states.length; i += batchSize) {
        const batch = states.slice(i, i + batchSize);
        const valueStrings: string[] = [];
        const queryParams: any[] = [];
        let paramIndex = 1;

        for (const s of batch) {
          valueStrings.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
          queryParams.push(countryId, s.isoCode, s.name, 'State / Province', true);
        }

        const sql = `INSERT INTO states (country_id, iso_state_code, official_name, admin_type, active)
                     VALUES ${valueStrings.join(', ')}
                     ON CONFLICT (country_id, iso_state_code, official_name) DO NOTHING`;
        await client.query(sql, queryParams);
      }
    }
  }

  const finalCountries = await client.query('SELECT COUNT(*) as count FROM countries');
  const finalStates = await client.query('SELECT COUNT(*) as count FROM states');
  console.log(`🌱 Seeding complete! Successfully seeded ${finalCountries.rows[0].count} countries and ${finalStates.rows[0].count} states into PostgreSQL.`);
}

/**
 * Seeds the local JSON file database schema in memory if empty
 */
export function seedLocationsMemory(dbData: any, saveToDisk: () => void) {
  if (!dbData.countries) dbData.countries = [];
  if (!dbData.states) dbData.states = [];

  if (dbData.countries.length > 0) {
    return;
  }

  console.log('🌱 Seeding Global Location System in developer preview JSON fallback...');
  
  const countries = Country.getAllCountries();
  let countryIdCounter = 1;
  let stateIdCounter = 1;

  for (const c of countries) {
    let iso3: string | null = null;
    try {
      const lookupResult = lookup.byIso(c.isoCode);
      iso3 = lookupResult ? lookupResult.iso3 : null;
    } catch (e) {
      // Fallback
    }

    const currencyCode = c.currency || null;
    const nativeName = c.name;
    const currencyName = currencyCode ? `${currencyCode} Currency` : null;
    const timezonesJson = JSON.stringify(c.timezones || []);

    const countryRecord: CountryRecord = {
      id: countryIdCounter++,
      iso2: c.isoCode,
      iso3,
      official_name: c.name,
      native_name: nativeName,
      flag_emoji: c.flag,
      phone_code: c.phonecode,
      currency_code: currencyCode,
      currency_name: currencyName,
      timezones: timezonesJson,
      active: true
    };
    dbData.countries.push(countryRecord);

    const states = State.getStatesOfCountry(c.isoCode);
    if (states) {
      for (const s of states) {
        dbData.states.push({
          id: stateIdCounter++,
          country_id: countryRecord.id,
          iso_state_code: s.isoCode,
          official_name: s.name,
          admin_type: 'State / Province',
          active: true
        });
      }
    }
  }

  saveToDisk();
  console.log(`🌱 Seeding complete! Loaded ${dbData.countries.length} countries and ${dbData.states.length} states into storage_metadata.json fallback.`);
}
