[
  {
    "?column?": "CREATE TABLE casino_reports (id integer NOT NULL, user_id uuid NULL, template_id integer NOT NULL, template_name text NOT NULL, day integer NOT NULL, month text NOT NULL, year integer NOT NULL, date date NOT NULL, created_at timestamp with time zone NULL, data jsonb NOT NULL);"
  },
  {
    "?column?": "CREATE TABLE category_videos (id integer NOT NULL, category_id integer NOT NULL, title text NOT NULL, created_at timestamp with time zone NULL, updated_at timestamp with time zone NULL, production_status video_status NULL, identifier integer NULL);"
  },
  {
    "?column?": "CREATE TABLE profiles (id uuid NOT NULL, email text NOT NULL, role text NOT NULL, name text NULL, created_at timestamp with time zone NULL);"
  },
  {
    "?column?": "CREATE TABLE user_activity (id integer NOT NULL, user_id uuid NOT NULL, action_type text NOT NULL, details text NOT NULL, created_at timestamp with time zone NOT NULL);"
  },
  {
    "?column?": "CREATE TABLE video_categories (id integer NOT NULL, identifier character varying(10) NOT NULL, title text NOT NULL, last_updated timestamp with time zone NULL, finished_count integer NULL, pending_count integer NULL, ready_to_publish_count integer NULL, user_id uuid NULL);"
  },
  {
    "?column?": "CREATE TABLE video_details (id integer NOT NULL, category_video_id integer NOT NULL, title text NOT NULL, instructions_miniature text NULL, rush_link text NULL, video_link text NULL, miniature_link text NULL, production_status video_status NULL, created_at timestamp with time zone NULL, updated_at timestamp with time zone NULL, description text NULL, edit_notes text NULL);"
  }
]