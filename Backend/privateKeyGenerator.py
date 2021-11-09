import hashlib
import time
import qrcode
import base64
from io import BytesIO
import json

def gen_QR_code(string):
    img = qrcode.make(str(string))
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue())
    return img_str


class user():
    def __init__(self, f_name, g_name, email):
        self.f_name = f_name
        self.g_name = g_name
        self.email = email
        # self.key = key

    def gen_hash(self, f_name, g_name, email):
        time_stamp = str(time.time())
        string = str(f_name).lower() + str(g_name).lower() + str(email).lower() + time_stamp
        string_hash = hashlib.sha256(string.encode('utf-8')).hexdigest()
        return string_hash

    def gen_jason(self):
        string_hash = self.gen_hash(self.f_name, self.g_name, self.email)
        tim = time.localtime()
        loc_time = str(tim.tm_year)+'-'+str(tim.tm_mon)+'-'+str(tim.tm_mday)+'-'+str(tim.tm_hour)+'-'+str(tim.tm_min)+'-'+str(tim.tm_sec)
        js_string = {
                    "fname": str(self.f_name).lower(),
                    "gname": str(self.g_name).lower(),
                    "email": str(self.email).lower(),
                    "private_key": str(string_hash),
                    "reg_time": str(loc_time)
                    }
        return json.dumps(js_string), string_hash


def main():
    f_name = ''
    g_name = ''
    email = ''

    user_1 = user(f_name, g_name, email)
    js_user, private_key = user_1.gen_jason()
    qrcode = gen_QR_code(private_key)

    js_out = open('./json/test.json', 'w')
    js_out.write(js_user)
    js_out.close()
    print(js_user)
    print(qrcode)


if __name__ == '__main__':
    main()
