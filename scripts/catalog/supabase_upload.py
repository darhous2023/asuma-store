"""
Upload images directly to Supabase S3-compatible storage.
Credentials sourced from Railway CLI (never stored in code or git).
"""
import sys, os, subprocess, json
sys.stdout.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)

SUPABASE_PROJECT = 'atmbrocqpjzemfpazzax'
SUPABASE_S3_ENDPOINT = f'https://{SUPABASE_PROJECT}.supabase.co/storage/v1/s3'
SUPABASE_PUBLIC_BASE = f'https://{SUPABASE_PROJECT}.supabase.co/storage/v1/object/public'

_creds_cache = {}

S3_CREDS_TEMP = os.path.join(os.environ.get('TEMP', '/tmp'), '.s3creds_tmp.json')

def _load_creds():
    if _creds_cache:
        return _creds_cache
    # Try temp creds file (written by PowerShell before calling this script)
    if os.path.exists(S3_CREDS_TEMP):
        try:
            data = json.load(open(S3_CREDS_TEMP))
            _creds_cache['access_key'] = data.get('S3_ACCESS_KEY_ID', '')
            _creds_cache['secret_key'] = data.get('S3_SECRET_ACCESS_KEY', '')
            _creds_cache['bucket'] = data.get('S3_BUCKET', 'asuma-products')
            _creds_cache['region'] = data.get('S3_REGION', 'eu-central-1')
            if _creds_cache['access_key'] and _creds_cache['secret_key']:
                return _creds_cache
        except Exception:
            pass
    # Try environment variables (set by caller)
    access = os.environ.get('S3_ACCESS_KEY_ID', '')
    secret = os.environ.get('S3_SECRET_ACCESS_KEY', '')
    if access and secret:
        _creds_cache['access_key'] = access
        _creds_cache['secret_key'] = secret
        _creds_cache['bucket'] = os.environ.get('S3_BUCKET', 'asuma-products')
        _creds_cache['region'] = os.environ.get('S3_REGION', 'eu-central-1')
        return _creds_cache
    # Fallback: run PowerShell railway command
    try:
        result = subprocess.run(
            ['powershell', '-NoProfile', '-Command',
             'railway variables --service asuma-backend --json'],
            capture_output=True, text=True, timeout=60, shell=False
        )
        if result.returncode != 0:
            raise RuntimeError(f"Railway CLI failed: {result.stderr[:200]}")
        data = json.loads(result.stdout)
        _creds_cache['access_key'] = data.get('S3_ACCESS_KEY_ID', '')
        _creds_cache['secret_key'] = data.get('S3_SECRET_ACCESS_KEY', '')
        _creds_cache['bucket'] = data.get('S3_BUCKET', 'asuma-products')
        _creds_cache['region'] = data.get('S3_REGION', 'eu-central-1')
        if not _creds_cache['access_key'] or not _creds_cache['secret_key']:
            raise RuntimeError("S3 credentials empty")
        return _creds_cache
    except Exception as e:
        raise RuntimeError(f"Failed to load S3 credentials: {e}")

def get_s3_client():
    try:
        import boto3
    except ImportError:
        import subprocess as sp
        sp.check_call([sys.executable, '-m', 'pip', 'install', 'boto3', '-q'])
        import boto3
    creds = _load_creds()
    return boto3.client(
        's3',
        endpoint_url=SUPABASE_S3_ENDPOINT,
        aws_access_key_id=creds['access_key'],
        aws_secret_access_key=creds['secret_key'],
        region_name=creds['region'],
    ), creds['bucket']

def upload_to_supabase(local_path, filename):
    """Upload a file to Supabase Storage and return the public URL."""
    s3, bucket = get_s3_client()
    with open(local_path, 'rb') as f:
        s3.put_object(
            Bucket=bucket,
            Key=filename,
            Body=f,
            ContentType='image/jpeg',
            CacheControl='max-age=31536000, public',
        )
    public_url = f'{SUPABASE_PUBLIC_BASE}/{bucket}/{filename}'
    return public_url

def verify_upload(url, timeout=15):
    """Verify uploaded file is publicly accessible."""
    try:
        import requests
        r = requests.head(url, timeout=timeout)
        return r.status_code == 200 and 'image' in r.headers.get('content-type', '')
    except Exception:
        return False

if __name__ == '__main__':
    # Test: upload a small test file
    import tempfile, os
    print("Testing Supabase S3 upload...")
    creds = _load_creds()
    print(f"Bucket: {creds['bucket']}, Region: {creds['region']}, Access key length: {len(creds['access_key'])}")
    # Create a tiny test image
    from PIL import Image
    import io
    img = Image.new('RGB', (100, 100), color=(180, 150, 50))
    tmp = os.path.join(os.environ.get('TEMP', '/tmp'), 'test_upload.jpg')
    img.save(tmp, 'JPEG', quality=80)
    url = upload_to_supabase(tmp, 'test_upload_delete_me.jpg')
    print(f"Uploaded → {url}")
    ok = verify_upload(url)
    print(f"Publicly accessible: {ok}")
    os.unlink(tmp)
