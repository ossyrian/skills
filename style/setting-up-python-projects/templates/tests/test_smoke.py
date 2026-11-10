import subprocess

import pytest

from my_project import greet


def test_entrypoint_runs_and_prints_the_greeting():
    result = subprocess.run(["uv", "run", "my-project"], capture_output=True, text=True)
    assert result.returncode == 0
    assert result.stdout == "Hello, world!\n"


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        pytest.param("Ada", "Hello, Ada!", id="a name"),
        pytest.param("", "Hello, !", id="an empty name"),
    ],
)
def test_greet(name, expected):
    assert greet(name) == expected
